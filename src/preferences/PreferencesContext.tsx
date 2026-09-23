import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultPreferences, preferenceService } from '../services/PreferenceService';

export type Preferences = {
  name: string; avatar: string; busColor: string; theme: 'green'|'blue'|'pink';
  favoriteLines: string[]; favoriteStops: string[];
  notifications: { approaching: boolean; serviceChanges: boolean; favoriteReminders: boolean };
  mobilityPreferences: { favoritesOnly: boolean; nearbyStops: boolean; showEta: boolean; showLocation: boolean };
  distanceUnit: 'km'|'m';
};
type ContextValue = { preferences: Preferences; update: (patch: Partial<Preferences>)=>void; toggleLine: (id:string)=>void; toggleStop:(name:string)=>void; reset:()=>void };
const PreferencesContext = createContext<ContextValue|null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences),[loaded,setLoaded]=useState(false);
  useEffect(()=>{let active=true;void preferenceService.getPreferences().then(value=>{if(active){setPreferences(value);setLoaded(true);}});return()=>{active=false;}},[]);
  useEffect(() => { if(loaded) void preferenceService.savePreferences(preferences); }, [preferences,loaded]);
  useEffect(() => { document.documentElement.dataset.appTheme = preferences.theme; document.documentElement.dataset.showEta = String(preferences.mobilityPreferences.showEta); }, [preferences.theme, preferences.mobilityPreferences.showEta]);
  const value = useMemo<ContextValue>(() => ({ preferences, update: patch => setPreferences(p => ({ ...p, ...patch })), toggleLine: id => setPreferences(p => ({ ...p, favoriteLines: p.favoriteLines.includes(id) ? p.favoriteLines.filter(x=>x!==id) : [...p.favoriteLines,id] })), toggleStop: name => setPreferences(p => ({ ...p, favoriteStops: p.favoriteStops.includes(name) ? p.favoriteStops.filter(x=>x!==name) : [...p.favoriteStops,name] })), reset: () => { void preferenceService.resetPreferences().then(setPreferences); } }), [preferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
export function usePreferences() { const value = useContext(PreferencesContext); if (!value) throw new Error('PreferencesProvider em falta'); return value; }
