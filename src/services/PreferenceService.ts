import type { Preferences } from '../preferences/PreferencesContext';
import { apiUrl } from '../api/config';

export interface PreferenceService { getPreferences(): Promise<Preferences>; savePreferences(preferences: Preferences): Promise<void>; resetPreferences(): Promise<Preferences> }
export const defaultPreferences: Preferences = { name: 'Viajante', avatar: '🙂', busColor: '#19a879', theme: 'green', favoriteLines: ['12'], favoriteStops: [], notifications: { approaching: true, serviceChanges: true, favoriteReminders: false }, mobilityPreferences: { favoritesOnly: false, nearbyStops: true, showEta: true, showLocation: true }, distanceUnit: 'km' };
const storageKey='busTrackPreferences';

/** Browser storage is only a local demo cache. It does not represent a production database. */
export const localPreferenceService: PreferenceService = {
  async getPreferences() {
    try {
      const current=localStorage.getItem(storageKey);
      if(current){const saved=JSON.parse(current);return {...defaultPreferences,...saved,notifications:{...defaultPreferences.notifications,...saved.notifications},mobilityPreferences:{...defaultPreferences.mobilityPreferences,...(saved.mobilityPreferences||saved.mobility)}};}
      return {...defaultPreferences,favoriteLines:JSON.parse(localStorage.getItem('bt-favs')||'["12"]'),theme:localStorage.getItem('bt-theme')==='azul'?'blue':localStorage.getItem('bt-theme')==='rosa'?'pink':'green',busColor:localStorage.getItem('bt-accent')||defaultPreferences.busColor,avatar:localStorage.getItem('bt-avatar')||defaultPreferences.avatar};
    } catch { return defaultPreferences; }
  },
  async savePreferences(preferences){try{localStorage.setItem(storageKey,JSON.stringify(preferences));}catch{/* The current session remains usable when browser storage is unavailable. */}},
  async resetPreferences(){const preferences={...defaultPreferences,favoriteLines:[]};await this.savePreferences(preferences);return preferences;}
};
async function remotePreferences(method:string,body?:Preferences):Promise<Preferences>{const response=await fetch(apiUrl('/users/me/preferences'),{method,credentials:'include',headers:{Accept:'application/json','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(!response.ok)throw new Error('Preferências remotas indisponíveis.');return response.json() as Promise<Preferences>;}
export const backendPreferenceService:PreferenceService={getPreferences:()=>remotePreferences('GET'),savePreferences:async preferences=>{await remotePreferences('PUT',preferences);},resetPreferences:()=>remotePreferences('DELETE')};
// The demo has no authenticated server session, so the selected source stays local until auth is configured.
export const preferenceService: PreferenceService = localPreferenceService;
