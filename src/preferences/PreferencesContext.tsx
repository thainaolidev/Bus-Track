import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Preferences = {
  name: string; avatar: string; busColor: string; theme: 'green'|'blue'|'pink';
  favoriteLines: string[]; favoriteStops: string[];
  notifications: { approaching: boolean; serviceChanges: boolean; favoriteReminders: boolean };
  mobilityPreferences: { favoritesOnly: boolean; nearbyStops: boolean; showEta: boolean; showLocation: boolean };
  distanceUnit: 'km'|'m';
};
const defaults: Preferences = { name: 'Viajante', avatar: '🙂', busColor: '#19a879', theme: 'green', favoriteLines: ['12'], favoriteStops: [], notifications: { approaching: true, serviceChanges: true, favoriteReminders: false }, mobilityPreferences: { favoritesOnly: false, nearbyStops: true, showEta: true, showLocation: true }, distanceUnit: 'km' };
const key = 'busTrackPreferences';
type ContextValue = { preferences: Preferences; update: (patch: Partial<Preferences>)=>void; toggleLine: (id:string)=>void; toggleStop:(name:string)=>void; reset:()=>void };
const PreferencesContext = createContext<ContextValue|null>(null);
function load(): Preferences {
  try {
    const current = localStorage.getItem(key);
    if (current) { const saved = JSON.parse(current); return { ...defaults, ...saved, notifications: { ...defaults.notifications, ...saved.notifications }, mobilityPreferences: { ...defaults.mobilityPreferences, ...(saved.mobilityPreferences || saved.mobility) } }; }
    return { ...defaults, favoriteLines: JSON.parse(localStorage.getItem('bt-favs') || '["12"]'), theme: localStorage.getItem('bt-theme') === 'azul' ? 'blue' : localStorage.getItem('bt-theme') === 'rosa' ? 'pink' : 'green', busColor: localStorage.getItem('bt-accent') || defaults.busColor, avatar: localStorage.getItem('bt-avatar') || defaults.avatar };
  } catch { return defaults; }
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(load);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(preferences)); } catch { /* Preferences remain available for this session. */ } }, [preferences]);
  useEffect(() => { document.documentElement.dataset.appTheme = preferences.theme; document.documentElement.dataset.showEta = String(preferences.mobilityPreferences.showEta); }, [preferences.theme, preferences.mobilityPreferences.showEta]);
  const value = useMemo<ContextValue>(() => ({ preferences, update: patch => setPreferences(p => ({ ...p, ...patch })), toggleLine: id => setPreferences(p => ({ ...p, favoriteLines: p.favoriteLines.includes(id) ? p.favoriteLines.filter(x=>x!==id) : [...p.favoriteLines,id] })), toggleStop: name => setPreferences(p => ({ ...p, favoriteStops: p.favoriteStops.includes(name) ? p.favoriteStops.filter(x=>x!==name) : [...p.favoriteStops,name] })), reset: () => setPreferences({ ...defaults, favoriteLines: [] }) }), [preferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
export function usePreferences() { const value = useContext(PreferencesContext); if (!value) throw new Error('PreferencesProvider em falta'); return value; }
