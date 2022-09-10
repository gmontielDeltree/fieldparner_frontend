    import { UploadI18n } from "@vaadin/upload";
    
    const i18n_upload: UploadI18n = {
      dropFiles: {
        one: 'Arrastre y Suelte aquí',
        many: 'Arrastre y Suelte aquí',
      },
      addFiles: {
        one: 'Subir Archivo...',
        many: 'Subir Archivo...',
      },
      error: {
        tooManyFiles: 'Liian monta tiedostoa.',
        fileIsTooBig: 'Tiedosto on liian suuri.',
        incorrectFileType: 'Archivo Incorrecto',
      },
      uploading: {
        status: {
          connecting: 'Conectando',
          stalled: 'Detenido',
          processing: 'Procesando',
          held: 'Esperando',
        },
        remainingTime: {
          prefix: 'Tiempo estimado: ',
          unknown: 'Tiempo estimado desconocido',
        },
        error: {
          serverUnavailable: 'Service Worker no disponible',
          unexpectedServerError: 'Error Inesperado',
          forbidden: 'Prohibido',
        },
      },
      units: {
        size: ['t', 'kt', 'Mt', 'Gt', 'Tt', 'Pt', 'Et', 'ZB', 'YB'],
        sizeBase: 1000,
      },
    };

    export {i18n_upload}