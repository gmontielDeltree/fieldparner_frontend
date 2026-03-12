import { format, parse } from "date-fns";

const formatDateIso8601 = (dateParts) => {
  const { year, month, day } = dateParts;
  const date = new Date(year, month, day);

  return format(date, "yyyy-MM-dd");
};

const parseDateIso8601 = (inputValue) => {
  const date = parse(inputValue, "yyyy-MM-dd", new Date());

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
};

const base_i18n = {
  // An array with the full names of months starting
  // with January.
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],

  // An array of weekday names starting with Sunday. Used
  // in screen reader announcements.
  weekdays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],

  // An array of short weekday names starting with Sunday.
  // Displayed in the calendar.
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

  // An integer indicating the first day of the week
  // (0 = Sunday, 1 = Monday, etc.).
  firstDayOfWeek: 0,

  // Used in screen reader announcements along with week
  // numbers, if they are displayed.
  week: "Semana",

  // Translation of the Calendar icon button title.
  calendar: "Calendar",

  // Translation of the Today shortcut button text.
  today: "Hoy",

  // Translation of the Cancel button text.
  cancel: "Cancelar",

  // Used for adjusting the year value when parsing dates with short years.
  // The year values between 0 and 99 are evaluated and adjusted.
  // Example: for a referenceDate of 1970-10-30;
  //   dateToBeParsed: 40-10-30, result: 1940-10-30
  //   dateToBeParsed: 80-10-30, result: 1980-10-30
  //   dateToBeParsed: 10-10-30, result: 2010-10-30
  // Supported date format: ISO 8601 `"YYYY-MM-DD"` (default)
  // The default value is the current date.
  referenceDate: "",

  // A function to format given `monthName` and
  // `fullYear` integer as calendar title string.
  formatTitle: (monthName, fullYear) => {
    return monthName + " " + fullYear;
  },

  formatDate: formatDateIso8601,
  parseDate: parseDateIso8601,
};


export {base_i18n}