const Papa = require('papaparse');
async function fetchSheet(id, name) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${name}`;
  const res = await fetch(url);
  const text = await res.text();
  return new Promise((resolve) => {
    Papa.parse(text, {
      complete: (results) => resolve(results.data.slice(0, 15))
    });
  });
}
async function run() {
  console.log("PLAN 2026:");
  console.dir(await fetchSheet("1f2-asu4IPQRaHsTB0vTff14_i2pHWK8Z", "2026"), {depth: null});
}
run();
