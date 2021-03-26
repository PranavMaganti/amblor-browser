export function timeToSeconds(time: string, seperator: string = ":"): number {
  const splitTime = time.split(seperator);
  return +splitTime[0] * 60 + +splitTime[1];
}
