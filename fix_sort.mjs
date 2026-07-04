import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove from inProgressOrders
content = content.replace(
  "// Następnie Nr Zlecenia (rosnąco)\n    if (a.id === 'SUMA PORTALI') return 1;\n    if (b.id === 'SUMA PORTALI') return -1;\n    return a.id.localeCompare(b.id);\n  });\n\n  // Obliczamy łączną wagę",
  "// Następnie Nr Zlecenia (rosnąco)\n    return a.id.localeCompare(b.id);\n  });\n\n  // Obliczamy łączną wagę"
);

// Add to completedOrders
content = content.replace(
  "const completedOrders = completedOrdersList.sort((a, b) => {\n    // Sortowanie: Najpierw po łącznej wadze firmy (malejąco)\n    if (a.company !== b.company) {\n      const weightA = completedCompanyWeights.get(a.company) || 0;\n      const weightB = completedCompanyWeights.get(b.company) || 0;\n      if (weightA !== weightB) {\n        return weightB - weightA;\n      }\n      return a.company.localeCompare(b.company);\n    }\n    // Następnie Nr Zlecenia (rosnąco)\n    return a.id.localeCompare(b.id);\n  });",
  `const completedOrders = completedOrdersList.sort((a, b) => {
    // Sortowanie: Najpierw po łącznej wadze firmy (malejąco)
    if (a.company !== b.company) {
      const weightA = completedCompanyWeights.get(a.company) || 0;
      const weightB = completedCompanyWeights.get(b.company) || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return a.company.localeCompare(b.company);
    }
    // Następnie Nr Zlecenia (rosnąco)
    if (a.id === 'SUMA PORTALI') return 1;
    if (b.id === 'SUMA PORTALI') return -1;
    return a.id.localeCompare(b.id);
  });`
);

fs.writeFileSync('src/App.tsx', content);
