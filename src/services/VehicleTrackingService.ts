import { routes } from '../data/routes';
import type { Vehicle } from '../types/transport';
import { apiConfig, apiUrl } from '../api/config';

export interface VehicleTrackingService { subscribe(listener: (vehicles: Vehicle[]) => void): () => void }

/** Local-only simulated positions. A real implementation can replace this with SSE/WebSocket/polling. */
export const mockVehicleTrackingService: VehicleTrackingService = {
  subscribe(listener) {
    const progress = [Math.floor(routes[0].coordinates.length*.22),Math.floor(routes[1].coordinates.length*.41),Math.floor(routes[2].coordinates.length*.61)];
    const emit = () => listener(routes.map((route,index) => { const point=route.coordinates[progress[index] % route.coordinates.length];progress[index]=(progress[index]+1)%route.coordinates.length;return { vehicleId:`demo-${route.id}`,routeId:route.id,latitude:point[0],longitude:point[1],timestamp:new Date().toISOString(),status:'simulated' as const }; }));
    emit(); const timer=window.setInterval(emit,1200);return ()=>window.clearInterval(timer);
  }
};
export const apiVehicleTrackingService:VehicleTrackingService={
  subscribe(listener){let active=true,busy=false,stopMock:(()=>void)|undefined;const poll=async()=>{if(!active||busy||stopMock)return;busy=true;try{const response=await fetch(apiUrl('/vehicles'),{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Vehicle API unavailable');listener(await response.json() as Vehicle[]);}catch{if(active&&!stopMock)stopMock=mockVehicleTrackingService.subscribe(listener);}finally{busy=false;}};void poll();const timer=window.setInterval(()=>void poll(),15000);return()=>{active=false;window.clearInterval(timer);stopMock?.();};}
};
export const vehicleTrackingService: VehicleTrackingService = apiConfig.configured ? apiVehicleTrackingService : mockVehicleTrackingService;
