import fs from 'fs';
let content = fs.readFileSync('src/lib/dataProcessing.ts', 'utf-8');

content = content.replace(
  "const planInfo = planMap.get(id);\n      let deadlineStr = planInfo?.deadlineStr || '-';",
  "let deadlineStr = planInfo?.deadlineStr || '-';"
);

fs.writeFileSync('src/lib/dataProcessing.ts', content);
