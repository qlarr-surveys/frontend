import dayjs from 'dayjs';


export function fDate(date, newFormat) {
  const fm = newFormat || "DD MMM YYYY"; 

  return date ? dayjs(date).format(fm) : "";
}