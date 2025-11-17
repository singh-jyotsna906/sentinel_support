/**
 * Generate a large transactions.json file for Sentinel Support assignment.
 * Usage: node transactions_generator.js [count]
 * Default count: 200000
 */
const fs = require('fs');
const path = require('path');

const count = parseInt(process.argv[2], 10) || 200000;
const outPath = path.join(__dirname, 'transactions.json');

const merchants = ['ABC Mart', 'QuickCab', 'SuperStore', 'CoffeeDay', 'BookWorld', 'TravelX', 'PharmaPlus'];
const mccs = ['5411', '4121', '5812', '5999', '4789', '5912'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
const countries = ['IN', 'US', 'SG', 'AE'];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

const transactions = [];
for (let i = 0; i < count; i++) {
  const customerId = 'C' + pad(1 + (i % 1000), 4);
  const cardId = 'CARD' + pad(1 + (i % 2000), 5);
  const merchant = random(merchants);
  const mcc = random(mccs);
  const amount = Math.floor(Math.random() * 100000) + 100;
  const ts = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString();
  const deviceId = 'DEV' + pad(1 + (i % 500), 4);
  const country = random(countries);
  const city = random(cities);
  transactions.push({
    id: 'TXN' + pad(i + 1, 8),
    customerId,
    cardId,
    mcc,
    merchant,
    amount_cents: amount,
    currency: 'INR',
    ts,
    device_id: deviceId,
    country,
    city
  });
}

fs.writeFileSync(outPath, JSON.stringify(transactions, null, 2));
console.log(`Generated ${count} transactions in ${outPath}`);
