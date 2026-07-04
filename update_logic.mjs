import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove PortalsSection import
content = content.replace(`import { PortalsSection } from './components/PortalsSection';\n`, '');

// 2. Add dashboardHala to activeOrders
content = content.replace(
  "const activeOrders = mainOrders.filter(\n    (o) => o.status.toLowerCase() !== \"zakończone\",\n  );",
  `const activeOrders = mainOrders.filter(
    (o) => o.status.toLowerCase() !== "zakończone",
  );
  if (dashboardHala) {
    activeOrders.push(dashboardHala);
  }`
);
content = content.replace(
  "const activeOrders = mainOrders.filter((o) => o.status.toLowerCase() !== \"zakończone\");",
  `const activeOrders = mainOrders.filter((o) => o.status.toLowerCase() !== "zakończone");
  if (dashboardHala) {
    activeOrders.push(dashboardHala);
  }`
);

// 3. Add completedPortals to completedOrdersList
content = content.replace(
  "const completedCompanyWeights = new Map<string, number>();",
  `const completedPortals = portals.filter(o => o.status.toLowerCase() === 'zakończone');
  if (completedPortals.length > 0) {
    const sumWeight = completedPortals.reduce((sum, p) => sum + p.weightT, 0);
    const sumRbh = completedPortals.reduce((sum, p) => sum + p.totalRbh, 0);
    const svenskCompany = completedOrdersList.find(o => o.company.toLowerCase().includes('svensk'))?.company || 'Svenskinfrateknik';
    
    completedOrdersList.push({
      id: 'SUMA PORTALI',
      company: svenskCompany,
      description: \`Zakończone Portale (\${completedPortals.length} poz.)\`,
      weightT: sumWeight,
      totalRbh: sumRbh,
      status: 'Zakończone',
      deadlineStr: '-',
      daysLeft: null,
      isPortal: true,
      isHala100: false,
      isStalTech: false,
      isErrorWeight: false
    });
  }

  const completedCompanyWeights = new Map<string, number>();`
);

// 4. Update completedOrders sort logic
content = content.replace(
  "// Następnie Nr Zlecenia (rosnąco)\n    return a.id.localeCompare(b.id);",
  `// Następnie Nr Zlecenia (rosnąco)
    if (a.id === 'SUMA PORTALI') return 1;
    if (b.id === 'SUMA PORTALI') return -1;
    return a.id.localeCompare(b.id);`
);

// 5. Update tabs state
content = content.replace(
  "const tabs = [\n    { id: 'aktywne', label: 'W Toku' },\n    { id: 'portale', label: 'Portale' },\n    ...(dashboardHala ? [{ id: 'hala', label: 'Hala Invest' }] : []),\n    ...(errorWeightOrders.length > 0 ? [{ id: 'bledy', label: 'Brak wagi' }] : []),\n    { id: 'zakonczone', label: 'Zakończone' }\n  ];",
  `const tabs = [
    { id: 'aktywne', label: 'W Toku' },
    ...(errorWeightOrders.length > 0 ? [{ id: 'bledy', label: 'Brak wagi' }] : []),
    { id: 'zakonczone', label: 'Zakończone' }
  ];`
);
// Make sure it works for both formatted and unformatted versions of tabs
content = content.replace(
  /const tabs = \[\s*{\s*id: 'aktywne', label: 'W Toku'\s*},\s*{\s*id: 'portale', label: 'Portale'\s*},\s*\.\.\.\(dashboardHala \? \[\{\s*id: 'hala', label: 'Hala Invest'\s*\}\] : \[\]\),\s*\.\.\.\(errorWeightOrders\.length > 0 \? \[\{\s*id: 'bledy', label: 'Brak wagi'\s*\}\] : \[\]\),\s*{\s*id: 'zakonczone', label: 'Zakończone'\s*}\s*\];/,
  `const tabs = [
    { id: 'aktywne', label: 'W Toku' },
    ...(errorWeightOrders.length > 0 ? [{ id: 'bledy', label: 'Brak wagi' }] : []),
    { id: 'zakonczone', label: 'Zakończone' }
  ];`
);

// 6. Update useEffect for tabs
content = content.replace(
  "if (activeTab === 'hala' && !dashboardHala) setActiveTab('aktywne');",
  ""
);

// 7. Remove render blocks for Portals and Hala
content = content.replace(
  /\{\s*activeTab === 'portale' && \(\s*<PortalsSection portals=\{portals\} \/>\s*\)\s*\}/,
  ""
);
content = content.replace(
  /\{\s*activeTab === 'hala' && dashboardHala && \(\s*<OrdersTable\s*orders=\{\[dashboardHala\]\}\s*title="INWESTYCJA: HALA"\s*emptyMessage="Brak zleceń Hala Invest\."\s*\/>\s*\)\s*\}/,
  ""
);
// Unformatted fallback
content = content.replace(
  "{activeTab === 'portale' && (\n            <PortalsSection portals={portals} />\n          )}",
  ""
);
content = content.replace(
  "{activeTab === 'hala' && dashboardHala && (\n            <OrdersTable \n              orders={[dashboardHala]} \n              title=\"INWESTYCJA: HALA\"\n              emptyMessage=\"Brak zleceń Hala Invest.\"\n            />\n          )}",
  ""
);

fs.writeFileSync('src/App.tsx', content);
