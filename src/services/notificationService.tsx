// src/services/notificationService.ts

import i18n from "i18next"; // Usamos la instancia de i18next

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'delete' | 'add' | 'update';

const createNotificationStyles = () => {
    if (!document.getElementById('toast-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'toast-styles';
        styleSheet.innerHTML = `
      @keyframes toast-progress {
        0% { width: 100%; }
        100% { width: 0%; }
      }
      
      @keyframes toast-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .toast-icon-pulse {
        animation: toast-pulse 1s ease-in-out;
      }

      .notification-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-end;
        pointer-events: none;
      }

      .notification-container > * {
        pointer-events: auto;
      }
    `;
        document.head.appendChild(styleSheet);

        const container = document.createElement('div');
        container.className = 'notification-container';
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
};

const getTitleFromType = (type: NotificationType): string => {
    switch (type) {
        case 'success': return i18n.t('success');
        case 'error': return i18n.t('error');
        case 'info': return i18n.t('info');
        case 'warning': return i18n.t('warning');
        case 'delete': return i18n.t('deleted');
        case 'add': return i18n.t('added');
        case 'update': return i18n.t('updated');
        default: return i18n.t('notification');
    }
};

const getColorFromType = (type: NotificationType): string => {
    switch (type) {
        case 'success':
        case 'add':
            return 'rgba(52, 199, 89, 0.85)';
        case 'error':
            return 'rgba(255, 69, 58, 0.85)';
        case 'warning':
            return 'rgba(255, 159, 10, 0.85)';
        case 'info':
            return 'rgba(90, 200, 250, 0.85)';
        case 'delete':
            return 'rgba(97, 97, 97, 0.85)';
        case 'update':
            return 'rgba(0, 122, 255, 0.85)';
        default:
            return 'rgba(52, 199, 89, 0.85)';
    }
};

const getIconFromType = (type: NotificationType): string => {
    switch (type) {
        case 'success':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        case 'error':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        case 'warning':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        case 'info':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        case 'delete':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        case 'add':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        case 'update':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
        default:
            return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    }
};

const showNotification = (
    type: NotificationType = 'success',
    title?: string,
    serviceData?: any,
    duration: number = 3000,
    serviceLabel?: string
): void => {
    createNotificationStyles();

    const notificationColor = getColorFromType(type);
    const notificationTitle = title || getTitleFromType(type);
    const notificationIcon = getIconFromType(type);

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.style.backgroundColor = notificationColor;
    toast.style.color = 'white';
    toast.style.padding = '14px 18px';
    toast.style.borderRadius = '12px';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.boxShadow = `0 8px 20px ${notificationColor.replace('0.85', '0.25')}, 0 2px 6px rgba(0, 0, 0, 0.1)`;
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'flex-start';
    toast.style.gap = '14px';
    toast.style.minWidth = '300px';
    toast.style.maxWidth = '90%';
    toast.style.border = `1px solid ${notificationColor.replace('0.85', '0.3')}`;
    toast.style.transform = 'translateY(20px)';
    toast.style.position = 'relative';

    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '32px';
    iconContainer.style.height = '32px';
    iconContainer.style.borderRadius = '50%';
    iconContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
    iconContainer.className = 'toast-icon-pulse';
    iconContainer.innerHTML = notificationIcon;

    const textContainer = document.createElement('div');
    textContainer.style.flex = '1';
    textContainer.style.display = 'flex';
    textContainer.style.flexDirection = 'column';
    textContainer.style.gap = '2px';

    const titleElement = document.createElement('div');
    titleElement.innerText = notificationTitle;
    titleElement.style.fontSize = '15px';
    titleElement.style.fontWeight = '600';
    titleElement.style.opacity = '0.95';
    titleElement.style.letterSpacing = '0.3px';
    titleElement.style.marginBottom = '2px';

    let serviceIdElement = null;
    if (serviceData) {
        serviceIdElement = document.createElement('div');
        let serviceValue = null;

        if (typeof serviceData === 'string') {
            serviceValue = serviceData;
        } else if (serviceData.service) {
            serviceValue = serviceData.service;
        } else if (serviceData._id) {
            serviceValue = serviceData._id;
        }

        if (serviceValue) {
            const prefix = serviceLabel || i18n.t('servicePrefix');
            serviceIdElement.innerText = `${prefix} ${serviceValue}`;
            serviceIdElement.style.fontSize = '13px';
            serviceIdElement.style.fontFamily = 'monospace';
            serviceIdElement.style.opacity = '0.9';
            serviceIdElement.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            serviceIdElement.style.padding = '2px 6px';
            serviceIdElement.style.borderRadius = '3px';
            serviceIdElement.style.display = 'inline-block';
            serviceIdElement.style.marginTop = '2px';
        }
    }

    const progressBar = document.createElement('div');
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '3px';
    progressBar.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    progressBar.style.borderBottomLeftRadius = '12px';
    progressBar.style.animation = `toast-progress ${duration}ms linear forwards`;

    const closeButton = document.createElement('div');
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeButton.style.opacity = '0.7';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '4px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.marginLeft = '8px';
    closeButton.style.transition = 'all 0.2s ease';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';

    closeButton.onmouseover = () => {
        closeButton.style.opacity = '1';
        closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    };

    closeButton.onmouseout = () => {
        closeButton.style.opacity = '0.7';
        closeButton.style.backgroundColor = 'transparent';
    };

    textContainer.appendChild(titleElement);
    if (serviceIdElement) {
        textContainer.appendChild(serviceIdElement);
    }

    toast.appendChild(iconContainer);
    toast.appendChild(textContainer);
    toast.appendChild(closeButton);
    toast.appendChild(progressBar);

    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(toast);
    } else {
        document.body.appendChild(toast);
    }

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    const closeToast = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    };

    const toastTimeout = setTimeout(closeToast, duration);

    closeButton.onclick = () => {
        clearTimeout(toastTimeout);
        closeToast();
    };
};

const showSuccess = (message?: string, serviceData?: any, serviceLabel?: string) =>
    showNotification('success', message, serviceData, 3000, serviceLabel);

const showError = (message?: string, serviceData?: any, serviceLabel?: string) =>
    showNotification('error', message, serviceData, 3000, serviceLabel);

const showInfo = (message?: string, serviceData?: any, serviceLabel?: string) =>
    showNotification('info', message, serviceData, 3000, serviceLabel);

const showWarning = (message?: string, serviceData?: any, serviceLabel?: string) =>
    showNotification('warning', message, serviceData, 3000, serviceLabel);

const showAdded = (serviceData?: any, serviceLabel?: string) =>
    showNotification('add', undefined, serviceData, 3000, serviceLabel);

const showUpdated = (serviceData?: any, serviceLabel?: string) =>
    showNotification('update', undefined, serviceData, 3000, serviceLabel);

const showDeleted = (serviceData?: any, serviceLabel?: string) =>
    showNotification('delete', undefined, serviceData, 3000, serviceLabel);

export const NotificationService = {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showAdded,
    showUpdated,
    showDeleted
};

export default NotificationService;
