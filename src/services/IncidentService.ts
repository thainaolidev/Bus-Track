import type { IncidentStatus, IncidentType, OperationalIncident, PassengerIncident } from '../types/incidents';

const initial:OperationalIncident[]=[{id:'demo-delay-line-12',type:'significant_delay',status:'in_progress',routeId:'12',reportedAt:'2026-09-23T08:16:00+01:00',updatedAt:'2026-09-23T08:20:00+01:00',estimatedResolution:'2026-09-23T09:00:00+01:00',impactMinutes:15,operatorNote:'Ocorrência simulada para demonstração; atraso associado ao serviço.',demo:true}];
// Internal coordinates are kept in module memory only; they are never written to browser storage.
let operationalStore:OperationalIncident[]=initial;
const labels:Record<IncidentType,string>={breakdown:'Avaria',accident:'Acidente',operational:'Incidente operacional',heavy_traffic:'Trânsito intenso',road_restriction:'Estrada condicionada',significant_delay:'Atraso significativo',cancelled_trip:'Viagem cancelada',route_change:'Alteração temporária de percurso'};
const activeStatuses:IncidentStatus[]=['reported','under_review','in_progress'];
function read():OperationalIncident[]{return operationalStore;}
function write(items:OperationalIncident[]){operationalStore=items;window.dispatchEvent(new Event('bus-track-incidents-changed'));}
function project(item:OperationalIncident):PassengerIncident{return {id:item.id,type:item.type,status:item.status,routeId:item.routeId,reportedAt:item.reportedAt,updatedAt:item.updatedAt,estimatedResolution:item.estimatedResolution,impactMinutes:item.impactMinutes,title:`Perturbação na Linha ${item.routeId}`,message:item.status==='resolved'?`A ocorrência de ${labels[item.type].toLowerCase()} na Linha ${item.routeId} foi resolvida e o serviço está a ser normalizado.`:`Foi registada uma ocorrência operacional (${labels[item.type].toLowerCase()}) que poderá causar atrasos na Linha ${item.routeId}. A equipa responsável foi informada.`,demo:item.demo};}

export interface PassengerIncidentService { getIncidents():Promise<PassengerIncident[]>;isVehicleVisible(vehicleId:string):boolean }
export interface OperationsIncidentService { getIncidents():Promise<OperationalIncident[]>;report(input:{type:IncidentType;routeId:string;vehicleId?:string;internalLocation?:[number,number]}):Promise<OperationalIncident>;update(id:string,patch:Partial<Pick<OperationalIncident,'status'|'routeId'|'estimatedResolution'|'operatorNote'|'impactMinutes'>>):Promise<void> }

/** Passenger contract never returns exact location, vehicle identity or operator notes. */
export const mockPassengerIncidentService:PassengerIncidentService={
  async getIncidents():Promise<PassengerIncident[]>{return read().filter(x=>x.status!=='closed').map(project);},
  isVehicleVisible(vehicleId:string):boolean{return !read().some(x=>activeStatuses.includes(x.status)&&(x.type==='accident'||x.type==='breakdown')&&x.vehicleId===vehicleId);}
};
/** Restricted mock operations contract; replace with an authenticated server API in production. */
export const mockOperationsIncidentService:OperationsIncidentService={
  async getIncidents():Promise<OperationalIncident[]>{return read();},
  async report(input:{type:IncidentType;routeId:string;vehicleId?:string;internalLocation?:[number,number]}):Promise<OperationalIncident>{const now=new Date().toISOString();const entry:OperationalIncident={id:`demo-${Date.now().toString(36)}`,...input,status:'reported',reportedAt:now,updatedAt:now,demo:true};write([entry,...read()]);return entry;},
  async update(id:string,patch:Partial<Pick<OperationalIncident,'status'|'routeId'|'estimatedResolution'|'operatorNote'|'impactMinutes'>>):Promise<void>{write(read().map(item=>item.id===id?{...item,...patch,updatedAt:new Date().toISOString()}:item));}
};
export const passengerIncidentService:PassengerIncidentService=mockPassengerIncidentService;
export const operationsIncidentService:OperationsIncidentService=mockOperationsIncidentService;
export const incidentTypeLabel=labels;
