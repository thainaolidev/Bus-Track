import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockTransportService, transportService } from './TransportService';
import { vehicleTrackingService } from './VehicleTrackingService';
import type { Arrival, Route, ServiceAlert, Stop, Vehicle } from '../types/transport';

type TransportData = { routes: Route[]; stops: Stop[]; vehicles: Vehicle[]; arrivals: Arrival[]; alerts: ServiceAlert[]; loading: boolean; error: string; warning: string; refresh: () => Promise<void> };
const TransportContext = createContext<TransportData|null>(null);
export function TransportProvider({ children }: { children: ReactNode }) {
  const [routes,setRoutes]=useState<Route[]>([]),[stops,setStops]=useState<Stop[]>([]),[vehicles,setVehicles]=useState<Vehicle[]>([]),[arrivals,setArrivals]=useState<Arrival[]>([]),[alerts,setAlerts]=useState<ServiceAlert[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[warning,setWarning]=useState('');
  const refresh = async () => { setLoading(true);setError('');setWarning('');try { const [r,s,v,a,n]=await Promise.all([transportService.getRoutes(),transportService.getStops(),transportService.getVehicles(),transportService.getArrivals(),transportService.getServiceAlerts()]);setRoutes(r);setStops(s);setVehicles(v);setArrivals(a);setAlerts(n); } catch { try { const [r,s,v,a,n]=await Promise.all([mockTransportService.getRoutes(),mockTransportService.getStops(),mockTransportService.getVehicles(),mockTransportService.getArrivals(),mockTransportService.getServiceAlerts()]);setRoutes(r);setStops(s);setVehicles(v);setArrivals(a);setAlerts(n);setWarning('A fonte de transporte não está disponível. A mostrar dados de demonstração.'); } catch { setError('Não foi possível carregar os dados de transporte.'); } } finally { setLoading(false); } };
  useEffect(()=>{ void refresh(); },[]);
  useEffect(()=>vehicleTrackingService.subscribe(setVehicles),[]);
  const value=useMemo(()=>({routes,stops,vehicles,arrivals,alerts,loading,error,warning,refresh}),[routes,stops,vehicles,arrivals,alerts,loading,error,warning]);
  return <TransportContext.Provider value={value}>{children}</TransportContext.Provider>;
}
export function useTransportData() { const value=useContext(TransportContext);if(!value)throw new Error('TransportProvider em falta');return value; }
