REVOKE INSERT, UPDATE ON public.profiles FROM authenticated, anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
CREATE POLICY "admin read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS request_key text;
CREATE UNIQUE INDEX IF NOT EXISTS redemptions_user_request_key ON public.redemptions(user_id, request_key) WHERE request_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS point_transactions_idem_key ON public.point_transactions(idempotency_key);

CREATE OR REPLACE FUNCTION public.redeem_pix(_product_id text, _pix_key text, _request_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE p public.products; uid uuid := auth.uid(); rid uuid; bal integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Faça login com a Twitch.'; END IF;
  IF length(trim(coalesce(_request_key,''))) < 8 THEN RAISE EXCEPTION 'Requisição inválida.'; END IF;
  SELECT id INTO rid FROM public.redemptions WHERE user_id=uid AND request_key=_request_key;
  IF FOUND THEN RETURN rid; END IF;
  IF length(trim(coalesce(_pix_key,''))) < 5 OR length(_pix_key) > 140 THEN RAISE EXCEPTION 'Informe sua chave PIX.'; END IF;
  SELECT * INTO p FROM public.products WHERE id=_product_id AND active FOR UPDATE;
  IF NOT FOUND OR p.stock <= 0 THEN RAISE EXCEPTION 'Recompensa indisponível.'; END IF;
  SELECT points INTO bal FROM public.profiles WHERE id=uid FOR UPDATE;
  IF bal IS NULL OR bal < p.price THEN RAISE EXCEPTION 'Points insuficientes.'; END IF;
  UPDATE public.profiles SET points = points - p.price WHERE id=uid;
  UPDATE public.products SET stock = stock - 1 WHERE id=p.id;
  INSERT INTO public.redemptions(user_id,product_id,product_name,cost,pix_key,request_key) VALUES (uid,p.id,p.name,p.price,trim(_pix_key),_request_key) RETURNING id INTO rid;
  INSERT INTO public.point_transactions(user_id,amount,reason,idempotency_key,actor) VALUES (uid,-p.price,'Resgate · '||p.name,'redeem-'||rid,'user');
  INSERT INTO public.audit_log(actor,action,details) VALUES (uid,'redeem',jsonb_build_object('redemption',rid,'product',p.id));
  RETURN rid;
END $$;
REVOKE EXECUTE ON FUNCTION public.redeem_pix(text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_pix(text,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.redeem_product(text,text) FROM PUBLIC, anon, authenticated;
COMMENT ON FUNCTION public.redeem_product(text,text) IS 'DEPRECATED: replaced by redeem_pix (idempotent)';

CREATE OR REPLACE FUNCTION public.admin_set_product(_id text, _stock integer, _active boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
  IF _stock < 0 THEN RAISE EXCEPTION 'Estoque inválido.'; END IF;
  UPDATE public.products SET stock=_stock, active=_active WHERE id=_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado.'; END IF;
  INSERT INTO public.audit_log(actor,action,details) VALUES (auth.uid(),'set_product',jsonb_build_object('id',_id,'stock',_stock,'active',_active));
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_set_product(text,integer,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_product(text,integer,boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_points(uuid,integer,text,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_review_redemption(uuid,text) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.club_members(_ranked_only boolean, _limit integer)
RETURNS TABLE(display_name text, avatar_url text, twitch_login text, points integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT p.display_name, p.avatar_url, p.twitch_login, p.points FROM public.profiles p
  WHERE p.twitch_id IS NOT NULL AND (NOT _ranked_only OR p.points > 0)
  ORDER BY p.points DESC, p.created_at ASC LIMIT least(greatest(coalesce(_limit,50),1),200)
$$;
GRANT EXECUTE ON FUNCTION public.club_members(boolean,integer) TO anon, authenticated;