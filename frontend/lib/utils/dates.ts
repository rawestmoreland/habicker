export const debugDateTime = (date: Date) => {
  console.log({
    UTC: date.toISOString(),
    Local: date.toString(),
    LocalTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

export const createCompletionDate = (dateString: string) => {
  // Store dates as simple date strings (YYYY-MM-DD) instead of full timestamps
  // This avoids timezone conversion issues when displaying completed dates
  return dateString;
};

export const formatDateForCalendar = (dateString: string): string => {
  if (!dateString) return '';
  
  // If the date is already in YYYY-MM-DD format, use it directly
  if (!dateString.includes('T')) {
    return dateString;
  }
  
  // If it's a full timestamp, format it using UTC to avoid timezone shifts
  const utcDate = new Date(dateString);
  return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`;
};

export const isSameDateIgnoreTimezone = (dateString1: string, dateString2: string | Date): boolean => {
  const date1 = formatDateForCalendar(dateString1);
  const date2 = typeof dateString2 === 'string' 
    ? formatDateForCalendar(dateString2)
    : formatDateForCalendar(dateString2.toISOString());
  
  return date1 === date2;
};

export const formatCompletedDatesForCalendar = (
  completedDates: string[]
): Record<string, { selected: boolean }> => {
  return completedDates.reduce((acc, dateString) => {
    if (!dateString) return acc;

    const formattedDate = formatDateForCalendar(dateString);

    return {
      ...acc,
      [formattedDate]: {
        selected: true,
      },
    };
  }, {});
};
