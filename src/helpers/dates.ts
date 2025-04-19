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


// helpers/dates.ts
export const getShortDate = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month (01-12)
    const dd = String(today.getDate()).padStart(2, '0');      // Day (01-31)
    return `${yyyy}-${mm}-${dd}`;
};
