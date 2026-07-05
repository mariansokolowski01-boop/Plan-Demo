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
  const planMap = new Map<string, { deadlineStr: string; dateObj: Date | null; statusRaw: string }>();
  
  // 1. Zbieramy daty i statusy z Planu Produkcji, mapując na baseId
  if (planData && planData.length > 9) {
    for (let i = 9; i < planData.length; i++) {
      const row = planData[i];
      if (!row) continue;
      
      const orderWew = row[4]?.toString().trim() || '';
      const orderClient = row[1]?.toString().trim() || '';
      const rawId = orderWew || orderClient;
      if (!rawId) continue;
      
      let baseId = rawId;
      const czMatch = rawId.match(/(.*?)\s*cz\.?\s*\d+/i);
      if (czMatch) {
          baseId = czMatch[1].trim();
      }
      
      let deadlineStr = row[7]?.toString().trim() || ''; // H (Data Zakończenia)
      if (!deadlineStr) {
          deadlineStr = row[6]?.toString().trim() || ''; // G (Data Wydania)
      }
      
      const parsedDate = parseDate(deadlineStr);
      let formattedDateStr = '';
      if (parsedDate) {
         formattedDateStr = `${parsedDate.getDate().toString().padStart(2, '0')}.${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}.${parsedDate.getFullYear()}`;
      }
      
      const statusRaw = row[14]?.toString().trim() || 'W toku';
      
      const existing = planMap.get(baseId);
      if (!existing) {
         planMap.set(baseId, { deadlineStr: formattedDateStr || deadlineStr, dateObj: parsedDate, statusRaw });
      } else {
         // Jeśli mamy części, bierzemy najpóźniejszą datę
         if (parsedDate && existing.dateObj && parsedDate.getTime() > existing.dateObj.getTime()) {
             planMap.set(baseId, { deadlineStr: formattedDateStr, dateObj: parsedDate, statusRaw });
         } else if (parsedDate && !existing.dateObj) {
             planMap.set(baseId, { deadlineStr: formattedDateStr, dateObj: parsedDate, statusRaw });
         }
         // Jeśli któraś część nie jest zakończona, nadpisujemy status
         if (statusRaw.toLowerCase() !== 'zakończone' && existing.statusRaw.toLowerCase() === 'zakończone') {
             existing.statusRaw = statusRaw;
         }
      }
    }
  }

  const orders: OrderData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Parsujemy Raport RBH jako główne źródło prawdy
  if (rbhData && rbhData.length > 1) {
    for (let i = 1; i < rbhData.length; i++) {
      const row = rbhData[i];
      if (!row || row.length <= 4) continue;
      
      const company = row[0]?.toString().trim() || 'Nieznana';
      const id = row[1]?.toString().trim();
      if (!id) continue;
      
      let desc = row[2]?.toString().trim() || '';
      if (id === 'PORTALE_OGÓLNE') {
          desc = 'zbiorcze zestawienie portali';
      }
      
      let weightStr = row[3]?.toString().replace(/\s/g, '').replace(',', '.') || '0';
      weightStr = weightStr.replace(/[^0-9.-]/g, '');
      const weightT = parseFloat(weightStr) || 0; // w Raporcie RBH to już są tony!
      
      let hoursStr = row[4]?.toString().replace(/\s/g, '').replace(',', '.') || '0';
      hoursStr = hoursStr.replace(/[^0-9.-]/g, '');
      const totalRbh = parseFloat(hoursStr) || 0;
      
      const rbhDaysStatus = row[7]?.toString().trim() || '';
      let statusRaw = rbhDaysStatus.toLowerCase() === 'zakończone' ? 'Zakończone' : 'W toku';
      const planInfo = planMap.get(id);
      
      // Jeżeli w planie jest jako zakończone, a RBH nie nadpisało inaczej, to oznaczamy Zakończone
      if (planInfo && planInfo.statusRaw.toLowerCase() === 'zakończone') {
          statusRaw = 'Zakończone';
      }
      if (desc.toLowerCase().includes('(zakończone')) {
          statusRaw = 'Zakończone';
      }
      let daysLeft: number | null = null;
      
      let deadlineStr = planInfo?.deadlineStr || '-';
      
      // Jeżeli RBH nie mówi że zakończone, ale mamy datę z planu, to liczymy dni
      if (statusRaw !== 'Zakończone' && planInfo?.dateObj) {
         const diffTime = planInfo.dateObj.getTime() - today.getTime();
         daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      // Upewniamy się, że to nie jest coś anulowanego
      if (planInfo?.statusRaw) {
         const lStatus = planInfo.statusRaw.toLowerCase();
         if (lStatus.includes('anulow') || lStatus.includes('canc') || lStatus.includes('przeniesione')) {
             continue; // pomijamy
         }
      }

      const isPortal = false; // nie używamy już isPortal do osobnej sekcji
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
