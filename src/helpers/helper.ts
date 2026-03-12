import { CurrencyCode, currencySymbolMap } from "../types";

export const capitalizeText = (text: string, allText: boolean = false): string => {
    // Verificar si la cadena está vacía
    if (text === '') return '';

    if (allText) {
        // Dividir la cadena en palabras
        const words = text.split(' ');
        // Capitalizar cada palabra y volver a unir la cadena
        const result = words.map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        return result;
    }
    else {
        // Capitalizar la primera letra y concatenar el resto de la cadena
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}

export class Helper {

    static parseDecimalPointToComaWithCurrency(
        value: number,
        currency: string,
        maxDecimal: number = 2
    ): string {
        if (value === undefined) return '';
        const valueWithZeroes = value.toLocaleString('en', {
            useGrouping: false,
            minimumFractionDigits: 2,
            maximumFractionDigits: maxDecimal,
        });
        let newValue = `${currency} ${valueWithZeroes
            .toString()
            .replace('.', ',')}`;

        if (currency) {
            newValue = `${currencySymbolMap[currency as CurrencyCode]}${valueWithZeroes.toString().replace('.', ',')}`;
        }
        newValue = Helper.numberWithThousandsSeparate(newValue);
        return newValue;
    }

    static numberWithThousandsSeparate(value: string): string {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

}

// Función para formatear números con separador de miles (.) y decimales (,)
export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '-';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '-';

  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};