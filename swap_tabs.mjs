import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "const tabs = [\n    { id: 'aktywne', label: 'W Toku' },\n    ...(errorWeightOrders.length > 0 ? [{ id: 'bledy', label: 'Brak wagi' }] : []),\n    { id: 'zakonczone', label: 'Zakończone' }\n  ];",
  `const tabs = [
    { id: 'aktywne', label: 'W Toku' },
    { id: 'zakonczone', label: 'Zakończone' },
    ...(errorWeightOrders.length > 0 ? [{ id: 'bledy', label: 'Brak wagi' }] : [])
  ];`
);

fs.writeFileSync('src/App.tsx', content);
