export const convertTimestampToDate = (unixTimestamp: number) => {

    const date = new Date(unixTimestamp * 1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    const formattedTime = `${hours}:${minutes.substring(-2)}:${seconds.substring(-2)}`;
    console.warn(formattedTime);
    return date;
}


export const getShortDate = () => {
    const fecha = new Date();

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // El mes es 0-indexado, por lo que agregamos 1 y formateamos
    const day = String(fecha.getDate()).padStart(2, '0');

    // Crear la cadena en el formato "yyyy-MM-dd"
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
}