import { useState } from 'react';

// "Today" for due-date maths, fixed for the life of the page so renders stay pure.
export function useToday(): Date {
  const [today] = useState(() => new Date());
  return today;
}
