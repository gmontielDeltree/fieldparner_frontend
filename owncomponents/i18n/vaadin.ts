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
        incorrectFileType: 'Väärä tiedostomuoto.',
      },
      uploading: {
        status: {
          connecting: 'Yhdistetään...',
          stalled: 'Pysäytetty',
          processing: 'Käsitellään tiedostoa...',
          held: 'Jonossa',
        },
        remainingTime: {
          prefix: 'aikaa jäljellä: ',
          unknown: 'jäljellä olevaa aikaa ei saatavilla',
        },
        error: {
          serverUnavailable: 'Palvelin ei vastaa',
          unexpectedServerError: 'Palvelinvirhe',
          forbidden: 'Kielletty',
        },
      },
      units: {
        size: ['t', 'kt', 'Mt', 'Gt', 'Tt', 'Pt', 'Et', 'ZB', 'YB'],
        sizeBase: 1000,
      },
    };

    export {i18n_upload}