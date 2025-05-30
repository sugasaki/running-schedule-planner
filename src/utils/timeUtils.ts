export const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
};

export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const calculateTotalTime = (startDateTime: string, lastCheckpoint: { date: string; arrivalTime: string }): string => {
  const start = new Date(startDateTime);
  const [month, day] = lastCheckpoint.date.split('/');
  const [hours, minutes] = lastCheckpoint.arrivalTime.split(':');
  const end = new Date(
    start.getFullYear(),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
  return `${diffHours}時間`;
};