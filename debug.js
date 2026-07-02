import fetch from 'node-fetch';
import * as fs from 'fs';

async function test() {
  const token = fs.readFileSync('.env.token', 'utf-8').trim(); // I don't have the token here.
}
