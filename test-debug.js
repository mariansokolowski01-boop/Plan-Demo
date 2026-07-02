import fs from 'fs';
import { getSheetData } from './src/lib/sheets.js';
import fetch from 'node-fetch';

async function test() {
  const token = fs.readFileSync('.env.token', 'utf-8').trim();
  const PLAN_SHEET_ID = '1f2-asu4IPQRaHsTB0vTff14_i2pHWK8Z';
  const RBH_SHEET_ID = '1tt3w3K0TIntDXfhi8l6ZPFzdW8G6bj6cOjMXo5mcQK4';

  const planRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${PLAN_SHEET_ID}/values/'2026'`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const planData = await planRes.json();
  console.log("PLAN HEADERS:");
  if (planData.values) {
     for (let i = 0; i < Math.min(25, planData.values.length); i++) {
        console.log(`Row ${i}:`, planData.values[i].slice(0, 15).join(' | '));
     }
  } else {
     console.log(planData);
  }
}
test();
