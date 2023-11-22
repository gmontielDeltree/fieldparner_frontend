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