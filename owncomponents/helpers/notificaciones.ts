
import '@vaadin/notification';
import {Notification} from "@vaadin/notification/src/vaadin-notification";

export const showNotification = (message: string, theme?: string, position?: string) => {
    const notification = <Notification> document.createElement('vaadin-notification');
    notification.renderer = (root: any, _owner: any) => {
      root.textContent = message;
    }
    if (theme) {
      notification.setAttribute("theme", theme);
    }
    if(position){
      notification.setAttribute("position",position)
    }
   //
    notification.opened = true;
    window.document.body.appendChild(notification);
    notification.addEventListener('opened-changed', () => window.document.body.removeChild(notification));
  }
  
  export const showNotificationTimed = (message: string, theme?: string, position?: string, timeout?:number = 5000) => {
    const notification = <Notification> document.createElement('vaadin-notification');
    notification.renderer = (root: any, _owner: any) => {
      root.textContent = message;
    }
    notification.duration = timeout
    
    if (theme) {
      notification.setAttribute("theme", theme);
    }
    if(position){
      notification.setAttribute("position",position)
    }
   //
    notification.opened = true;
    window.document.body.appendChild(notification);
    notification.addEventListener('opened-changed', () => window.document.body.removeChild(notification));
  }