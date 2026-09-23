import type { UserProfile } from '../types/transport';
import { apiUrl } from '../api/config';

export interface AuthService {
  signIn(email:string,password:string):Promise<UserProfile>;
  signUp(email:string,password:string,name:string):Promise<UserProfile>;
  signOut():Promise<void>;
  getCurrentUser():Promise<UserProfile|null>;
  updateProfile(patch:Partial<Pick<UserProfile,'name'|'avatar'>>):Promise<UserProfile>;
}
const demoUser:UserProfile={id:'demo-user',name:'Viajante',avatar:'🙂'};
/** Demo identity only. It never accepts or stores credentials and must not be mistaken for production auth. */
export const demoAuthService:AuthService={
  async signIn(){throw new Error('A autenticação não está configurada nesta demonstração.');},
  async signUp(){throw new Error('A criação de contas requer um backend de autenticação.');},
  async signOut(){},
  async getCurrentUser(){return demoUser;},
  async updateProfile(patch){return {...demoUser,...patch};}
};
async function authRequest<T>(path:string,method:string='GET',body?:unknown):Promise<T>{const response=await fetch(apiUrl(path),{method,credentials:'include',headers:{Accept:'application/json','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!response.ok)throw new Error(response.status===401?'Sessão inválida ou expirada.':'O serviço de autenticação não está disponível.');if(response.status===204)return undefined as T;return response.json() as Promise<T>;}
export const backendAuthService:AuthService={
  signIn:(email,password)=>authRequest<UserProfile>('/auth/sign-in','POST',{email,password}),
  signUp:(email,password,name)=>authRequest<UserProfile>('/auth/sign-up','POST',{email,password,name}),
  async signOut(){await authRequest<void>('/auth/sign-out','POST');},
  async getCurrentUser(){try{return await authRequest<UserProfile>('/users/me');}catch{return null;}},
  updateProfile:patch=>authRequest<UserProfile>('/users/me/profile','PATCH',patch)
};
// Auth remains deliberately demo-only until a backend, HTTPS and session policy are configured.
export const authService:AuthService=demoAuthService;
