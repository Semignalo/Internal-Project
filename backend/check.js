const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://starinc_user:starinc_password@192.168.1.201:5432/starinc_db',
});

async function main() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM "User"'); /* Prisma creates tables with uppercase */
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
