import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import { initialState } from './data';
import { WeLoveMMORewardsEngine as engine } from './rewards-engine';
import type { Product, RewardsState, User } from './model';
interface ClubContextValue { state:RewardsState; user:User|null; loginDemo:()=>void; logout:()=>void; redeem:(id:string,key:string)=>void; adjust:(amount:number,reason:string,key:string)=>void; saveProduct:(product:Product)=>void; goal:string; setGoal:(id:string)=>void }
const ClubContext=createContext<ClubContextValue|null>(null);
export function ClubProvider({children}:{children:ReactNode}) {
 const [state,setState]=useState(initialState); const current=useRef(state);
 const [user,setUser]=useState<User|null>(null); const [goal,setGoal]=useState('mouse');
 function update(fn:(s:RewardsState)=>RewardsState) { const next=fn(current.current); current.current=next; setState(next); }
 return <ClubContext.Provider value={{state,user,goal,setGoal,loginDemo:()=>setUser({id:'demo-player',displayName:'Player WeLoveMMO',level:12,demo:true}),logout:()=>setUser(null),redeem:(id,key)=>update(s=>engine.redeem(s,id,key)),adjust:(amount,reason,key)=>update(s=>engine.registerBonus(s,amount,reason,key)),saveProduct:p=>update(s=>engine.saveProduct(s,p))}}>{children}</ClubContext.Provider>;
}
export function useClub() { const context=useContext(ClubContext); if(!context) throw new Error('ClubProvider required'); return context; }
