export const parseDateTimeString = (
  dateTime: string | null
): { date: string | null; time: string | null } => {
  if (!dateTime) {
    return { date: null, time: null };
  }

  const [date, time] = dateTime.split(' ');
  
  return { 
    date: date || null, 
    time: time || null 
  };
};