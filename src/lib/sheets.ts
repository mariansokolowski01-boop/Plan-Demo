import * as XLSX from 'xlsx';

export async function getSheetData(fileId: string, token: string, sheetIdOrName?: number | string): Promise<any[][]> {
  // 1. Sprawdź typ pliku za pomocą Google Drive API
  const driveMetaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!driveMetaRes.ok) {
    let errText = await driveMetaRes.text();
    try {
      const errJson = JSON.parse(errText);
      errText = errJson.error?.message || errText;
    } catch (e) {}
    throw new Error(`Błąd pobierania metadanych pliku (HTTP ${driveMetaRes.status}): ${errText}`);
  }

  const driveMeta = await driveMetaRes.json();
  const mimeType = driveMeta.mimeType;

  // 2. Jeśli to Google Sheet (Arkusz Google)
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!metaRes.ok) {
      let errText = await metaRes.text();
      try {
        const errJson = JSON.parse(errText);
        errText = errJson.error?.message || errText;
      } catch (e) {}
      throw new Error(`Błąd pobierania metadanych arkusza (HTTP ${metaRes.status}): ${errText}`);
    }
    const meta = await metaRes.json();
    
    let range = '';
    if (typeof sheetIdOrName === 'number') {
      const sheet = meta.sheets.find((s: any) => s.properties.sheetId === sheetIdOrName);
      if (sheet) {
        range = `'${sheet.properties.title}'`;
      } else {
        throw new Error(`Nie znaleziono zakładki o ID ${sheetIdOrName}`);
      }
    } else if (typeof sheetIdOrName === 'string') {
       range = `'${sheetIdOrName}'`;
    } else {
      range = `'${meta.sheets[0].properties.title}'`;
    }

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/${range}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      let errText = await res.text();
      try {
        const errJson = JSON.parse(errText);
        errText = errJson.error?.message || errText;
      } catch (e) {}
      throw new Error(`Błąd pobierania danych (HTTP ${res.status}): ${errText}`);
    }
    const data = await res.json();
    return data.values || [];
  } 
  
  // 3. Jeśli to plik Excel (np. .xlsx)
  else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType.includes('excel')) {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      let errText = await res.text();
      try {
        const errJson = JSON.parse(errText);
        errText = errJson.error?.message || errText;
      } catch (e) {}
      throw new Error(`Błąd pobierania pliku Excel (HTTP ${res.status}): ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let sheetName = workbook.SheetNames[0];
    // Niestety sheetId w URL dla Excela na Google Drive jest często hashem lub innym ID, które nie mapuje się bezpośrednio 1:1 na indexy w pliku xlsx tak łatwo.
    // Ale w tym przypadku, spróbujmy użyć pierwszej zakładki, chyba że mamy nazwę.
    
    if (typeof sheetIdOrName === 'string') {
        if (workbook.SheetNames.includes(sheetIdOrName)) {
            sheetName = sheetIdOrName;
        }
    } else if (typeof sheetIdOrName === 'number') {
         // Dla Excela GDrive zazwyczaj indeksuje je od 0
         // Zakładamy na razie pierwszą zakładkę dla .xlsx, 
         // bo 'gid' z Google Sheets nie ma odpowiednika w wewnętrznym pliku Excela.
         // Zobaczymy czy to zadziała.
    }

    const worksheet = workbook.Sheets[sheetName];
    // Zamieniamy na tablicę tablic (header: 1)
    const json = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
    
    // Filtrowanie pustych wierszy z końca
    while(json.length > 0 && json[json.length - 1].every(cell => cell === '' || cell == null)) {
      json.pop();
    }
    
    return json;
  }
  
  else {
    throw new Error(`Nieobsługiwany typ pliku: ${mimeType}. Oczekiwano Arkusza Google lub pliku Excel.`);
  }
}
