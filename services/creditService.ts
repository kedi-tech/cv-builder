const CREDIT_KEY = 'user_credits';

export const getCredits = (): number => {
  if (typeof window === 'undefined') return 0;
  const credits = localStorage.getItem(CREDIT_KEY);
  return credits ? parseInt(credits, 10) : 0;
};

export const addCredits = (amount: number): number => {
  const current = getCredits();
  const newTotal = current + amount;
  localStorage.setItem(CREDIT_KEY, newTotal.toString());
  return newTotal;
};

export const useCredits = (amount: number): boolean => {
  const current = getCredits();
  if (current < amount) return false;
  
  localStorage.setItem(CREDIT_KEY, (current - amount).toString());
  return true;
};
