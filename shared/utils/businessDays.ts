import deliveryConfig from '../config/delivery-times.json';

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Check if a date is a holiday
 */
function isHoliday(date: Date, holidays: string[]): boolean {
  const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  return holidays.includes(dateStr);
}

/**
 * Add business days to a date, excluding weekends and holidays
 * @param startDate - Starting date (default: today)
 * @param businessDays - Number of business days to add
 * @returns The calculated end date
 */
export function addBusinessDays(
  startDate: Date = new Date(),
  businessDays: number
): Date {
  const result = new Date(startDate);
  const holidays = deliveryConfig.holidays;
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    
    // Skip weekends and holidays
    if (!isWeekend(result) && !isHoliday(result, holidays)) {
      daysAdded++;
    }
  }

  return result;
}

/**
 * Format date for display (e.g., "Martes 10 febrero")
 */
export function formatDeliveryDate(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayName} ${day} ${month}`;
}
