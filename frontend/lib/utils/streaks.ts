export function countStreaks(dateStrings: string[]): { longestStreak: number; currentStreak: number } {
  // Parse dates and sort them
  const dates = dateStrings.map(date => new Date(date)).sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (let i = 0; i < dates.length; i++) {
    if (lastDate === null || Math.ceil((dates[i].getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
      currentStreak++;
    } else {
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      currentStreak = 1;
    }
    lastDate = dates[i];
  }

  // Update the longest streak if the current streak is longer
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Check if the current streak is still ongoing
  const today = new Date();
  const lastRecordedDate = dates[dates.length - 1];
  const daysSinceLastRecord = Math.ceil((today.getTime() - lastRecordedDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastRecord > 1) {
    currentStreak = 0;
  }

  return { longestStreak, currentStreak };
}