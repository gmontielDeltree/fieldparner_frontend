
import '@vaadin/notification';
import {Notification} from "@vaadin/notification/src/vaadin-notification";

export const showNotification = (message: string, theme?: string) => {
    const notification = <Notification> document.createElement('vaadin-notification');
    notification.renderer = (root: any, _owner: any) => {
      root.textContent = message;
    }
    if (theme) {
      notification.setAttribute("theme", theme);
    }
    notification.opened = true;
    window.document.body.appendChild(notification);
    notification.addEventListener('opened-changed', () => window.document.body.removeChild(notification));
  }