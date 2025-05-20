
/**
 * Format a number as a currency string using PLN
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};
