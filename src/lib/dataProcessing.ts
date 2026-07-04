import { OrderData } from '../types';

function parseDate(val: any): Date | null {
  if (!val) return null;
  const str = val.toString().trim();
  
  if (/^\d+$/.test(str)) {
    const serial = parseInt(str, 10);
    return new Date(Date.UTC(1899, 11, 30) + serial * 24 * 60 * 60 * 1000);
  }
  
  const dates = str.split('\n').map(d => d.trim()).filter(d => d);
  const lastDateStr = dates[dates.length - 1];
  
  if (!lastDateStr) return null;

  const parts = lastDateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (parts) {
    return new Date(parseInt(parts[3], 10), parseInt(parts[2], 10) - 1, parseInt(parts[1], 10));
  }
  
  const d = new Date(lastDateStr);
  if (!isNaN(d.getTime())) return d;
  
  return null;
}

export function processOrders(planData: any[][], rbhData: any[][]): OrderData[] {
  const rbhMap = new Map<string, number>();

  if (rbhData && rbhData.length > 1) {
    for (let i = 1; i < rbhData.length; i++) {
      const row = rbhData[i];
      if (!row || row.length <= 4) continue;
      
      const orderWew = row[1]?.toString().trim();
      if (!orderWew) continue;
      
      let hoursStr = row[4]?.toString().replace(/\s/g, '').replace(',', '.') || '0';
      hoursStr = hoursStr.replace(/[^0-9.-]/g, '');
      const hours = parseFloat(hoursStr);
      
      if (!isNaN(hours)) {
        rbhMap.set(orderWew, (rbhMap.get(orderWew) || 0) + hours);
      }
    }
  }

  const orders: OrderData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (planData && planData.length > 9) {
    for (let i = 9; i < planData.length; i++) {
      const row = planData[i];
      if (!row) continue;
      
      const orderWew = row[4]?.toString().trim() || '';
      const orderClient = row[1]?.toString().trim() || '';
      const id = orderWew || orderClient;
      if (!id) continue;
      
      const statusRaw = row[14]?.toString().trim() || 'W toku';
      const status = statusRaw.toLowerCase();
      
      if (status.includes('anulow') || status.includes('canc') || status.includes('przeniesione')) {
        continue;
      }

      const company = row[2]?.toString().trim() || 'Nieznana';
      const desc = row[3]?.toString().trim() || '';
      
      let weightT = 0;
      let weightStr = row[11]?.toString().replace(/\s/g, '').replace(',', '.') || '0';
      weightStr = weightStr.replace(/[^0-9.-]/g, '');
      const weightKg = parseFloat(weightStr);
      if (!isNaN(weightKg)) {
          weightT = weightKg / 1000;
      }
      
      const totalRbh = rbhMap.get(orderWew) || 0;
      
      let deadlineStr = row[7]?.toString().trim() || ''; // H (Data Zakończenia)
      if (!deadlineStr) {
          deadlineStr = row[6]?.toString().trim() || ''; // G (Data Wydania) jako fallback
      }

      let daysLeft: number | null = null;
      const parsedDate = parseDate(deadlineStr);
      if (parsedDate) {
        const diffTime = parsedDate.getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Formatowanie dla czytelności (np. z seriala do stringa DD.MM.YYYY)
        deadlineStr = `${parsedDate.getDate().toString().padStart(2, '0')}.${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}.${parsedDate.getFullYear()}`;
      }
      
      if (status === 'zakończone') {
          daysLeft = null;
      }
      
      const isPortal = desc.toLowerCase().includes('portal') || id.toLowerCase().includes('portal');
      const isHala100 = id.startsWith('100/');
      const isStalTech = company.toLowerCase().includes('stal-tech');
      const isErrorWeight = weightT <= 0;

      orders.push({
        id,
        company,
        description: desc,
        weightT,
        status: statusRaw,
        totalRbh,
        deadlineStr,
        daysLeft,
        isPortal,
        isHala100,
        isStalTech,
        isErrorWeight
      });
    }
  }

  return orders;
}
