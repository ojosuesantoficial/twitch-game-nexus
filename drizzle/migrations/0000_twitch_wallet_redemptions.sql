
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitch_id text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitch_login text;
UPDATE public.profiles SET points = 0;

-- points can only change through security definer functions
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  stock integer NOT NULL CHECK (stock >= 0),
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products readable" ON public.products FOR SELECT USING (true);
INSERT INTO public.products (id,name,price,stock) VALUES
 ('pix-30','Sorteio PIX R$30',100000,50),
 ('pix-80','PIX R$80',150000,20),
 ('pix-100','PIX R$100',190000,20);

CREATE TABLE public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL CHECK (amount <> 0),
  reason text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  actor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.point_transactions TO authenticated;
GRANT ALL ON public.point_transactions TO service_role;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx" ON public.point_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.block_tx_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'point_transactions is immutable'; END $$;
CREATE TRIGGER point_tx_immutable BEFORE UPDATE OR DELETE ON public.point_transactions
  FOR EACH ROW EXECUTE FUNCTION public.block_tx_mutation();

CREATE TABLE public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  cost integer NOT NULL,
  pix_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.redemptions TO authenticated;
GRANT ALL ON public.redemptions TO service_role;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own redemptions" ON public.redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.redeem_product(_product_id text, _pix_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.products; uid uuid := auth.uid(); rid uuid; bal integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Faça login com a Twitch.'; END IF;
  IF length(trim(coalesce(_pix_key,''))) < 5 THEN RAISE EXCEPTION 'Informe sua chave PIX.'; END IF;
  SELECT * INTO p FROM public.products WHERE id=_product_id AND active FOR UPDATE;
  IF NOT FOUND OR p.stock <= 0 THEN RAISE EXCEPTION 'Drop indisponível.'; END IF;
  SELECT points INTO bal FROM public.profiles WHERE id=uid FOR UPDATE;
  IF bal IS NULL OR bal < p.price THEN RAISE EXCEPTION 'Points insuficientes.'; END IF;
  UPDATE public.profiles SET points = points - p.price WHERE id=uid;
  UPDATE public.products SET stock = stock - 1 WHERE id=p.id;
  INSERT INTO public.redemptions(user_id,product_id,product_name,cost,pix_key) VALUES (uid,p.id,p.name,p.price,trim(_pix_key)) RETURNING id INTO rid;
  INSERT INTO public.point_transactions(user_id,amount,reason,idempotency_key,actor) VALUES (uid,-p.price,'Resgate · '||p.name,'redeem-'||rid,'user');
  INSERT INTO public.audit_log(actor,action,details) VALUES (uid,'redeem',jsonb_build_object('redemption',rid,'product',p.id));
  RETURN rid;
END $$;
GRANT EXECUTE ON FUNCTION public.redeem_product(text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_adjust_points(_user uuid, _amount integer, _reason text, _key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
  IF _amount = 0 OR coalesce(trim(_reason),'')='' OR coalesce(trim(_key),'')='' THEN RAISE EXCEPTION 'Dados inválidos.'; END IF;
  UPDATE public.profiles SET points = points + _amount WHERE id=_user AND points + _amount >= 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Usuário não encontrado ou saldo insuficiente.'; END IF;
  INSERT INTO public.point_transactions(user_id,amount,reason,idempotency_key,actor) VALUES (_user,_amount,_reason,_key,auth.uid()::text);
  INSERT INTO public.audit_log(actor,action,details) VALUES (auth.uid(),'adjust_points',jsonb_build_object('user',_user,'amount',_amount,'reason',_reason));
END $$;
GRANT EXECUTE ON FUNCTION public.admin_adjust_points(uuid,integer,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_review_redemption(_id uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.redemptions;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
  IF _status NOT IN ('paid','rejected') THEN RAISE EXCEPTION 'Status inválido.'; END IF;
  SELECT * INTO r FROM public.redemptions WHERE id=_id AND status='pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Resgate não está pendente.'; END IF;
  UPDATE public.redemptions SET status=_status, reviewed_by=auth.uid(), reviewed_at=now() WHERE id=_id;
  IF _status='rejected' THEN
    UPDATE public.profiles SET points = points + r.cost WHERE id=r.user_id;
    UPDATE public.products SET stock = stock + 1 WHERE id=r.product_id;
    INSERT INTO public.point_transactions(user_id,amount,reason,idempotency_key,actor) VALUES (r.user_id,r.cost,'Estorno · '||r.product_name,'refund-'||r.id,auth.uid()::text);
  END IF;
  INSERT INTO public.audit_log(actor,action,details) VALUES (auth.uid(),'review_redemption',jsonb_build_object('id',_id,'status',_status));
END $$;
GRANT EXECUTE ON FUNCTION public.admin_review_redemption(uuid,text) TO authenticated;
