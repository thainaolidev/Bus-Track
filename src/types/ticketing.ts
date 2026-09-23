export type FareCategory='single'|'day_pass'|'monthly_pass'|'interurban';
export interface FareProduct { id:string;name:string;category:FareCategory;priceCents:number;description:string;validityMinutes?:number;conditions:string;demo:true }
export interface DigitalTicket { id:string;productId:string;routeId:string;originStopId:string;destinationStopId:string;issuedAt:string;validFrom:string;validUntil:string;priceCents:number;status:'active'|'future'|'expired';paymentStatus:'simulated';demo:true }
