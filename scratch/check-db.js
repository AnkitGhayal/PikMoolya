const { Client } = require('./apps/api/node_modules/pg');

async function check() {
  const c = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/pikmoolya' });
  await c.connect();
  const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'price_predictions'");
  console.log('Columns in price_predictions:', res.rows);
  await c.end();
}

check().catch(console.error);
