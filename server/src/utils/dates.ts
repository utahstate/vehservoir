// Returns all time periods in subtrahend not intersecting minuends
export const subtractRanges = (
  subtrahend: [Date, Date],
  minuends: [Date, Date][],
): [Date, Date][] => {
  console.log(subtrahend, minuends);
  if (
    !(
      subtrahend[0].getTime() <= subtrahend[1].getTime() &&
      minuends.every(([start, end]) => start.getTime() <= end.getTime())
    )
  ) {
    throw new Error('Invalid arguments');
  }

  // Truncated ranges to the subtrahend and sorted by start times then end times
  const truncatedTimes = minuends
    .map(([start, end]) => [
      new Date(Math.max(subtrahend[0].getTime(), start.getTime())),
      new Date(Math.min(subtrahend[1].getTime(), end.getTime())),
    ])
    .filter(
      ([start, end]) =>
        start.getTime() <= subtrahend[1].getTime() &&
        end.getTime() >= subtrahend[0].getTime(),
    )
    .sort(([startA, endA], [startB, endB]) => {
      if (startA.getTime() === startB.getTime()) {
        return endA.getTime() - endB.getTime();
      }
      return startA.getTime() - startB.getTime();
    });

  // Calculate the set difference between subtrahend and the "set" minuends
  let previousEnd = subtrahend[0];
  const result: [Date, Date][] = [];
  for (const [start, end] of truncatedTimes) {
    if (previousEnd.getTime() < start.getTime()) {
      result.push([previousEnd, start]);
    }
    previousEnd = new Date(Math.max(previousEnd.getTime(), end.getTime()));
  }

  // We have some trailing time - fill it until end
  if (previousEnd.getTime() < subtrahend[1].getTime()) {
    result.push([previousEnd, subtrahend[1]]);
  }

  return result;
};

export const applyTimezoneOffset = (date: Date, seconds: number) => {
  return new Date(date.getTime() - seconds * 1000);
};

export const toTimeZone = (date: Date, timeZone: string) => {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone }));
};

export const clockString = (hours: number, minutes: number) =>
  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

const addSeconds = (date: Date, seconds: number) =>
  new Date(date.getTime() + seconds * 1000);

export const seperateDateRange = (
  [start, end]: [Date, Date],
  periodSeconds: number,
  separationSeconds: number,
  maxEntries = 20,
): [Date, Date][] => {
  const result: [Date, Date][] = [];

  let begin = start;
  let finish = addSeconds(start, periodSeconds);
  let i = 0;
  while (finish.getTime() <= end.getTime() && i < maxEntries) {
    result.push([begin, finish]);
    begin = addSeconds(begin, separationSeconds);
    finish = addSeconds(finish, separationSeconds);
    i++;
  }
  return result;
};
