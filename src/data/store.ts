import { RAW_ORDERS_CSV } from './rawOrdersCsv';

export interface Order {
  company: string;
  orderNumber: string;
  description: string;
  weightT: number;
  totalRbh: number;
  rbhPerT: number;
  rbhPerKgMin: number;
  isMinKg: boolean;
  daysToFinish?: number;
  status: string;
  year?: string;
}

function parseNumber(str: string): number {
  if (!str) return 0;
  // Replace comma with dot, remove spaces
  const normalized = str.replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

export function parseOrders(csv: string): Order[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(';');
  
  const orders: Order[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Split by comma, careful with quotes if any (though standard data doesn't seem to have them)
    const parts = line.split(';');
    
    if (parts.length < 8) continue;
    
    // Nazwa firmy;Nr. Zlecenia ST;Opis;Masa [t];Suma RBH;RBH / t;RBH / kg (w min);Dni do zakończenia;Status
    const company = parts[0].trim();
    const orderNumber = parts[1].trim();
    const description = parts[2].trim();
    const weightT = parseNumber(parts[3]);
    const totalRbh = parseNumber(parts[4]);
    const rbhPerT = parseNumber(parts[5]);
    const rbhPerKgMin = parseNumber(parts[6]);
    const isMinKg = parts[6] !== undefined && parts[6].trim() !== '';
    
    const daysRaw = parts[7]?.trim();
    const daysToFinish = daysRaw ? parseInt(daysRaw, 10) : undefined;
    
    const status = parts[8] ? parts[8].trim() : parts[parts.length - 1].trim();
    
    // Extract year from order number if present e.g., 003/26
    let year = "2024"; // default
    if (orderNumber.includes('/23')) year = "2023";
    else if (orderNumber.includes('/24')) year = "2024";
    else if (orderNumber.includes('/25')) year = "2025";
    else if (orderNumber.includes('/26')) year = "2026";
    
    orders.push({
      company,
      orderNumber,
      description,
      weightT,
      totalRbh,
      rbhPerT,
      rbhPerKgMin,
      isMinKg,
      daysToFinish,
      status,
      year
    });
  }
  
  return orders;
}

export const allOrders = parseOrders(RAW_ORDERS_CSV);

// Filter out Hala orders from standard operations
export const isHalaOrder = (orderNum: string) => orderNum.startsWith('100/24') || orderNum.startsWith('100/25') || orderNum.startsWith('100/26');

export const standardOrders = allOrders.filter(o => !isHalaOrder(o.orderNumber));
export const halaOrders = allOrders.filter(o => isHalaOrder(o.orderNumber));

export function getStatsForYear(year: string) {
  const yearOrders = standardOrders.filter(o => o.year === year);
  const totalWeight = yearOrders.reduce((sum, o) => sum + o.weightT, 0);
  const totalRbh = yearOrders.reduce((sum, o) => sum + o.totalRbh, 0);
  
  // Calculate average RBH/t excluding orders that use min/kg
  const ordersForRbhPt = yearOrders.filter(o => !o.isMinKg);
  const weightForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.weightT, 0);
  const rbhForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.totalRbh, 0);
  const yieldRbhPt = weightForRbhPt > 0 ? (rbhForRbhPt / weightForRbhPt) : 0;
  
  const ordersOver1t = ordersForRbhPt.filter(o => o.weightT > 1);
  const weightOver1t = ordersOver1t.reduce((sum, o) => sum + o.weightT, 0);
  const rbhOver1t = ordersOver1t.reduce((sum, o) => sum + o.totalRbh, 0);
  const yieldOver1t = weightOver1t > 0 ? (rbhOver1t / weightOver1t) : 0;

  const ordersUnder1t = ordersForRbhPt.filter(o => o.weightT <= 1);
  const weightUnder1t = ordersUnder1t.reduce((sum, o) => sum + o.weightT, 0);
  const rbhUnder1t = ordersUnder1t.reduce((sum, o) => sum + o.totalRbh, 0);
  const yieldUnder1t = weightUnder1t > 0 ? (rbhUnder1t / weightUnder1t) : 0;

  return { year, totalWeight, totalRbh, yieldRbhPt, yieldOver1t, yieldUnder1t };
}

export function getHalaSummarized() {
  const totalWeight = halaOrders.reduce((sum, o) => sum + o.weightT, 0);
  const totalRbh = halaOrders.reduce((sum, o) => sum + o.totalRbh, 0);
  
  // Calculate average RBH/t excluding orders that use min/kg
  const ordersForRbhPt = halaOrders.filter(o => !o.isMinKg);
  const weightForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.weightT, 0);
  const rbhForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.totalRbh, 0);
  const yieldRbhPt = weightForRbhPt > 0 ? (rbhForRbhPt / weightForRbhPt) : 0;
  
  return { totalWeight, totalRbh, yieldRbhPt };
}
