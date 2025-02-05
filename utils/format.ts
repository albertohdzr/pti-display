// utils/format.ts
interface FormatCurrencyOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showCurrency?: boolean;
  currencyDisplay?: "symbol" | "code" | "name";
}

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR', 'MXN')
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'USD') // '$1,234.56'
 * formatCurrency(1234.56, 'EUR', { locale: 'es-ES' }) // '1.234,56 €'
 * formatCurrency(1234.56, 'MXN', { minimumFractionDigits: 0 }) // '$1,235'
 * formatCurrency(1234.56, 'USD', { showCurrency: false }) // '1,234.56'
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  options: FormatCurrencyOptions = {},
): string {
  const {
    locale = "en-US",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showCurrency = true,
    currencyDisplay = "symbol",
  } = options;

  try {
    if (!showCurrency) {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount);
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      currencyDisplay,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);

    // Fallback básico en caso de error
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Parsea un string de moneda a número
 * @param value - El string a parsear
 * @returns número o null si no es válido
 *
 * @example
 * parseCurrency('$1,234.56') // 1234.56
 * parseCurrency('1.234,56 €') // 1234.56
 */
export function parseCurrency(value: string): number | null {
  try {
    // Eliminar todo excepto números, punto y coma
    const cleanValue = value.replace(/[^0-9.,]/g, "");

    // Si usa coma como separador decimal
    if (cleanValue.indexOf(",") > cleanValue.indexOf(".")) {
      return parseFloat(cleanValue.replace(/\./g, "").replace(",", "."));
    }

    // Si usa punto como separador decimal
    return parseFloat(cleanValue.replace(/,/g, ""));
  } catch (error) {
    console.error("Error parsing currency:", error);

    return null;
  }
}

/**
 * Formatea un número como porcentaje
 * @param value - El número a formatear
 * @param decimals - Número de decimales
 * @returns String formateado como porcentaje
 *
 * @example
 * formatPercentage(0.1234) // '12.34%'
 * formatPercentage(0.1234, 1) // '12.3%'
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
