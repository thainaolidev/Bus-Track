import type { DigitalTicket,FareProduct } from '../types/ticketing';

export interface TicketingService { getFares():Promise<FareProduct[]>;getMyTickets():Promise<DigitalTicket[]>;purchase(input:Pick<DigitalTicket,'productId'|'routeId'|'originStopId'|'destinationStopId'> & {validFrom?:string}):Promise<DigitalTicket> }
export const demoFares:FareProduct[]=[
  {id:'demo-single',name:'Bilhete simples',category:'single',priceCents:120,description:'1 viagem urbana',validityMinutes:60,conditions:'Válido para uma viagem na linha seleccionada. Preço fictício para demonstração.',demo:true},
  {id:'demo-day',name:'Passe diário',category:'day_pass',priceCents:400,description:'Viagens ilimitadas durante 24 horas',validityMinutes:1440,conditions:'Válido por 24 horas após activação. Produto e preço simulados.',demo:true},
  {id:'demo-month',name:'Passe mensal',category:'monthly_pass',priceCents:3000,description:'Passe urbano mensal',conditions:'Zonas, descontos e condições oficiais não estão configurados. Valor meramente ilustrativo.',demo:true},
  {id:'demo-interurban',name:'Bilhete interurbano',category:'interurban',priceCents:250,description:'Tarifa interurbana de demonstração',validityMinutes:120,conditions:'Tarifa não oficial; preço e âmbito dependem de validação do operador.',demo:true}
];
const key='busTrackDemoTickets';
function read():DigitalTicket[]{try{return JSON.parse(localStorage.getItem(key)||'[]') as DigitalTicket[]}catch{return[]}}
function write(tickets:DigitalTicket[]){try{localStorage.setItem(key,JSON.stringify(tickets))}catch{/* Ticket wallet stays available in current memory session. */}window.dispatchEvent(new Event('bus-track-tickets-changed'));}
function withStatus(ticket:DigitalTicket,now=Date.now()):DigitalTicket{const start=new Date(ticket.validFrom).getTime(),end=new Date(ticket.validUntil).getTime();return {...ticket,status:start>now?'future':end<now?'expired':'active'}}
export const mockTicketingService:TicketingService={
 async getFares(){return demoFares;},
 async getMyTickets(){return read().map(ticket=>withStatus(ticket));},
 async purchase(input){const fare=demoFares.find(item=>item.id===input.productId);if(!fare)throw new Error('Bilhete indisponível.');const now=new Date(),validFrom=input.validFrom?new Date(input.validFrom):now;if(Number.isNaN(validFrom.getTime()))throw new Error('Data de utilização inválida.');const duration=fare.category==='monthly_pass'?30*24*60:fare.validityMinutes||60,until=new Date(validFrom.getTime()+duration*60_000);const ticket:DigitalTicket={...input,id:`DM-${now.getTime().toString(36).toUpperCase()}`,issuedAt:now.toISOString(),validFrom:validFrom.toISOString(),validUntil:until.toISOString(),priceCents:fare.priceCents,status:validFrom.getTime()>now.getTime()?'future':'active',paymentStatus:'simulated',demo:true};write([ticket,...read()]);return ticket;}
};
export const ticketingService:TicketingService=mockTicketingService;
export const formatFare=(priceCents:number)=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(priceCents/100);
