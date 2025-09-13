export const formatDisplayTime = (time: string): string => {
  const _temp = time.split(":");
  const temp = _temp[0] + ":" + _temp[1];
  return temp;
};
