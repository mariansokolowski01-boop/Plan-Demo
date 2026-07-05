const Papa = require('papaparse');
async function fetchSheet(id, name) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${name}`;
  const res = await fetch(url);
  const text = await res.text();
  return new Promise((resolve) => {
    Papa.parse(text, {
      complete: (results) => resolve(results.data.slice(0, 20))
    });
  });
}
async function run() {
  console.log("RBH 2026:");
  console.dir(await fetchSheet("1tt3w3K0TIntDXfhi8l6ZPFzdW8G6bj6cOjMXo5mcQK4", "2026"), {depth: null});
}
run();
