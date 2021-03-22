export function timeToSeconds(time: string): number {
  const splitTime = time.split(":");
  return +splitTime[0] * 60 + +splitTime[1];
}
