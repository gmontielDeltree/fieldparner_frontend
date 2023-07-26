# Registro del service worker
El componente <pwa-update> se encarga de registrar el sw y de notificar al usuario cuando existe una actualizacion del mismo.
Emite el evento SKIP_WAITING cuando el usuario da click en "update". Hasta ese momento el SW esta en WAITING.
El SW tiene un listener en ese evento que cuando se recibe hace el skipWaiting.

## Se prodria hacer que la pagina se refresque automaticamente:
https://codyanhorn.tech/blog/pwa-reload-page-on-application-update

## Se prodria notificar cuando se instala la nueva version:
