import Papa from 'papaparse';

export async function getSheetData(fileId: string, sheetName: string = '2026'): Promise<any[][]> {
  // Pobieranie publicznego arkusza jako CSV (Google Sheets pozwala na pobranie publicznego pliku przez gviz)
  const url = `https://docs.google.com/spreadsheets/d/${fileId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Błąd pobierania danych (HTTP ${res.status}). Upewnij się, że arkusz jest publiczny ("Każda osoba mająca link").`);
  }
  
  const csvText = await res.text();
  
  // Jeżeli odpowiedź to HTML (np. strona logowania Google), to znaczy że plik nie jest publiczny
  if (csvText.trim().startsWith('<html') || csvText.trim().startsWith('<!DOCTYPE html>')) {
    throw new Error('Otrzymano stronę HTML zamiast danych. Arkusz prawdopodobnie nie jest udostępniony publicznie ("Każda osoba mająca link").');
  }

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as any[][]);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}
