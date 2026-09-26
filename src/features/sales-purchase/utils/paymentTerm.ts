// "On delivery" / "Within 1 day" / "Within 30 days".
export const payWithin = (days: number) => (days <= 0 ? 'On delivery' : `Within ${days} day${days === 1 ? '' : 's'}`);

// Conventional names: "Cash on delivery" for 0, otherwise "Net 30".
export const suggestTermName = (days: number) => (days <= 0 ? 'Cash on delivery' : `Net ${days}`);
