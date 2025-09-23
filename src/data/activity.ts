import { employeeActivities } from './employees';
import { investmentActivities } from './investment';
import { stockActivities } from './stock';
import { studentActivities } from './students';

export const recentActivities = [...studentActivities, ...stockActivities, ...employeeActivities, ...investmentActivities]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 12);
