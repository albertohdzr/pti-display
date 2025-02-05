// utils/date.ts
import { format, parseISO, isValid } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function formatDateForInput(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";

  try {
    let dateObj: Date;

    if (typeof date === "string") {
      // Intentar parsear la fecha string
      dateObj = parseISO(date);
      if (!isValid(dateObj)) {
        // Si no es válida, intentar crear una nueva fecha directamente
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    // Verificar si la fecha es válida
    if (!isValid(dateObj)) {
      console.warn("Invalid date provided:", date);

      return "";
    }

    return format(dateObj, DATE_FORMAT);
  } catch (error) {
    console.warn("Error formatting date:", error);

    return "";
  }
}

export function formatDateForDisplay(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";

  try {
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = parseISO(date);
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      console.warn("Invalid date provided:", date);

      return "";
    }

    return format(dateObj, "PPP p");
  } catch (error) {
    console.warn("Error formatting date:", error);

    return "";
  }
}
