async function test() {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1f2-asu4IPQRaHsTB0vTff14_i2pHWK8Z', {
    headers: { Authorization: `Bearer [object Object]` }
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
