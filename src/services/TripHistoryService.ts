import type { PassengerIncident, TripRecord } from '../types/incidents';
import { passengerIncidentService } from './IncidentService';
const historyKey='busTrackDemoTripHistory';
const demoTrips:TripRecord[]=[{id:'demo-trip-20260923-001',serviceDate:'2026-09-23',boardingTime:'08:15',routeId:'12',vehicleId:'demo-12',originStopId:'terminal',destinationStopId:'hospital',scheduledDeparture:'08:15',scheduledArrival:'08:42',actualArrival:'08:57',estimatedDurationMinutes:42,delayMinutes:15,incidentId:'demo-delay-line-12',demo:true}];
export interface TripHistoryItem extends TripRecord { incident?:PassengerIncident;proofId:string }
export interface TripProof { proofId:string;trip:TripHistoryItem;issuedAt:string;platformName:string;automaticRecord:boolean;demo:boolean }
export interface TripHistoryService { getHistory():Promise<TripHistoryItem[]>;getProof(tripId:string):Promise<TripProof|null> }
function read():TripRecord[]{try{const raw=localStorage.getItem(historyKey);return raw?JSON.parse(raw) as TripRecord[]:demoTrips;}catch{return demoTrips;}}
export const mockTripHistoryService:TripHistoryService={
  async getHistory():Promise<TripHistoryItem[]>{const incidents=await passengerIncidentService.getIncidents();return read().map(trip=>({...trip,incident:incidents.find(item=>item.id===trip.incidentId),proofId:`BT-${trip.serviceDate.replace(/-/g,'')}-DM01`})).sort((a,b)=>`${b.serviceDate} ${b.boardingTime}`.localeCompare(`${a.serviceDate} ${a.boardingTime}`));},
  async getProof(tripId:string):Promise<TripProof|null>{const trip=(await this.getHistory()).find(item=>item.id===tripId);if(!trip)return null;return{proofId:trip.proofId,trip,issuedAt:new Date().toISOString(),platformName:'Bus Track',automaticRecord:true,demo:trip.demo};}
};
export const tripHistoryService:TripHistoryService=mockTripHistoryService;
