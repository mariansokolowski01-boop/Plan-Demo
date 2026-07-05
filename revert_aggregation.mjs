import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove the manual aggregation
content = content.replace(
  /const completedPortals = portals\.filter[\s\S]*?const completedCompanyWeights = new Map<string, number>\(\);/,
  "const completedCompanyWeights = new Map<string, number>();"
);

// Update sorting to push PORTALE_OGÓLNE to the bottom
content = content.replace(
  /if \(a\.id === 'SUMA PORTALI'\) return 1;\s*if \(b\.id === 'SUMA PORTALI'\) return -1;/g,
  "if (a.id === 'PORTALE_OGÓLNE') return 1;\n    if (b.id === 'PORTALE_OGÓLNE') return -1;"
);

fs.writeFileSync('src/App.tsx', content);

let dpContent = fs.readFileSync('src/lib/dataProcessing.ts', 'utf-8');
dpContent = dpContent.replace(
  "const isPortal = desc.toLowerCase().includes('portal') || id.toLowerCase().includes('portal');",
  "const isPortal = false;" // We don't need isPortal anymore
);
fs.writeFileSync('src/lib/dataProcessing.ts', dpContent);

