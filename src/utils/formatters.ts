// src/utils/formatters.ts

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Add the missing formatTime function
export const formatTime = (timeString: string): string => {
  if (!timeString) return '--:--';
  
  // Handle both "HH:MM" format and full ISO date strings
  if (timeString.includes('T')) {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  
  // For simple "HH:MM" strings
  return timeString;
};

// Optional: Format hours with decimal places
export const formatHours = (hours: number): string => {
  return hours.toFixed(2);
};