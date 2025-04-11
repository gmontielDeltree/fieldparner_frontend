import { useMemo } from "react";

export const useYearOptionsHook = () => {
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = [];
    for (let year = currentYear; year >= 1960; year--) {
      yearsArray.push(year.toString());
    }
    return yearsArray;
  }, []);

  return { years };
};