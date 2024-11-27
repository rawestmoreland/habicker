export const debugDateTime = (date: Date) => {
  console.log({
    UTC: date.toISOString(),
    Local: date.toString(),
    LocalTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

export const createCompletionDate = (dateString: string) => {
  // Extract the date parts from the dateString instead of using timestamp
  const [year, month, date] = dateString.split('-').map(Number);

  // Create UTC date string for selected date at midnight
  // Note: month is 0-indexed in Date constructor
  return new Date(Date.UTC(year, month - 1, date, 0, 0, 0, 0)).toISOString();
};

export const formatCompletedDatesForCalendar = (
  completedDates: string[]
): Record<string, { selected: boolean }> => {
  return completedDates.reduce((acc, dateString) => {
    if (!dateString) return acc;

    // Parse the UTC date string
    const utcDate = new Date(dateString);

    // Format as YYYY-MM-DD using the date parts
    const localDate = `${utcDate.getUTCFullYear()}-${String(
      utcDate.getUTCMonth() + 1
    ).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`;

    return {
      ...acc,
      [localDate]: {
        selected: true,
      },
    };
  }, {});
};
