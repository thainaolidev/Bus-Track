import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { passengerIncidentService } from './IncidentService';
import type { PassengerIncident } from '../types/incidents';
type PublicIncidentFeed={incidents:PassengerIncident[];isVehicleVisible:(vehicleId:string)=>boolean;refresh:()=>Promise<void>};
const Context=createContext<PublicIncidentFeed|null>(null);
export function IncidentProvider({children}:{children:ReactNode}){const[incidents,setIncidents]=useState<PassengerIncident[]>([]);const refresh=async()=>setIncidents(await passengerIncidentService.getIncidents());useEffect(()=>{void refresh();const changed=()=>void refresh();window.addEventListener('bus-track-incidents-changed',changed);return()=>window.removeEventListener('bus-track-incidents-changed',changed);},[]);const value=useMemo(()=>({incidents,isVehicleVisible:passengerIncidentService.isVehicleVisible,refresh}),[incidents]);return <Context.Provider value={value}>{children}</Context.Provider>;}
export function usePublicIncidents(){const value=useContext(Context);if(!value)throw new Error('IncidentProvider em falta');return value;}
