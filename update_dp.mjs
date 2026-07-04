import fs from 'fs';
let content = fs.readFileSync('src/lib/dataProcessing.ts', 'utf-8');

content = content.replace(
  "const isPortal = false;",
  "const isPortal = desc.toLowerCase().includes('portal') || id.toLowerCase().includes('portal');"
);

fs.writeFileSync('src/lib/dataProcessing.ts', content);
