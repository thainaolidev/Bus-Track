export interface AppNotification { id:string; title:string; body:string; createdAt:string; read:boolean }
export interface NotificationService { getNotifications(userId:string):Promise<AppNotification[]>; requestPermission():Promise<'granted'|'denied'|'unsupported'> }
/** Alert preferences are local-only. No push permission or remote delivery is requested by the prototype. */
export const mockNotificationService:NotificationService={
  async getNotifications(){return [];},
  async requestPermission(){return 'unsupported';}
};
export const notificationService:NotificationService=mockNotificationService;
