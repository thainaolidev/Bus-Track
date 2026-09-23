export const apiConfig={baseUrl:import.meta.env.VITE_API_URL?.trim()||'',configured:Boolean(import.meta.env.VITE_API_URL?.trim())};
export function apiUrl(path:string){const base=apiConfig.baseUrl.replace(/\/$/,'');const suffix=path.startsWith('/')?path:`/${path}`;return base?`${base}${suffix}`:suffix;}
