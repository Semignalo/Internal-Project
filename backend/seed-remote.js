const { Client } = require('pg');

const DB_URL = 'postgresql://starinc_user:starinc_password@192.168.1.201:5432/starinc_db';

const client = new Client({ connectionString: DB_URL });

async function main() {
  await client.connect();
  console.log('Connected to TrueNAS PostgreSQL!');

  // Check current users
  const check = await client.query('SELECT email FROM "User"');
  console.log('Current users:', check.rows);

  if (check.rows.length === 0) {
    console.log('No users found. Seeding...');

    await client.query(`
      INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), 'Sam Manager', 'sam@starinc.com', 'password', 'PROJECT_MANAGER', NOW(), NOW()),
        (gen_random_uuid(), 'Sarah Lee', 'sarah@starinc.com', 'password', 'MEMBER', NOW(), NOW()),
        (gen_random_uuid(), 'Mike Johnson', 'mike@starinc.com', 'password', 'MEMBER', NOW(), NOW())
    `);

    console.log('Seed complete! 3 users created.');
  } else {
    console.log('Users already exist, no seeding needed.');
  }

  // Final check
  const final = await client.query('SELECT id, name, email, password, role FROM "User"');
  console.log('All users in DB:', final.rows);

  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  await client.end();
});
