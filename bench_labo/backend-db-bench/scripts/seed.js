import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import pkg from 'pg';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MYSQL_HOST = process.env.MYSQL_HOST || 'mysql';
const MYSQL_USER = process.env.MYSQL_USER || 'app';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'app';
const MYSQL_DB = process.env.MYSQL_DB || 'appdb';

const PG_HOST = process.env.PG_HOST || 'postgres';
const PG_USER = process.env.PG_USER || 'app';
const PG_PASSWORD = process.env.PG_PASSWORD || 'app';
const PG_DB = process.env.PG_DB || 'appdb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017';
const MONGO_DB_NAME = process.env.MONGO_DB || 'appdb';

const N_PRODUCTS = 10000;

function makeProduct(i) {
  return {
    id: i,
    name: `Product ${i}`,
    price: (i % 100) + 0.99,
    stock: i % 500,
    created_at: new Date(2020, 0, 1 + (i % 365)),
  };
}

async function seedMysql() {
  const pool = await mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB,
     multipleStatements: true,   // <--- AJOUT IMPORTANT
  });

  const schemaPath = path.join(__dirname, '../sql/mysql_schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schemaSql);
  await pool.query('DELETE FROM products');

  const batchSize = 1000;
  for (let start = 1; start <= N_PRODUCTS; start += batchSize) {
    const end = Math.min(start + batchSize - 1, N_PRODUCTS);
    const values = [];
    const placeholders = [];

    for (let i = start; i <= end; i++) {
      const p = makeProduct(i);
      placeholders.push('(?,?,?,?,?)');
      values.push(p.id, p.name, p.price, p.stock, p.created_at);
    }

    const sql =
      'INSERT INTO products (id, name, price, stock, created_at) VALUES ' +
      placeholders.join(',');
    await pool.query(sql, values);
    console.log(`MySQL inserted up to ${end}`);
  }

  await pool.end();
}

async function seedPostgres() {
  const pool = new Pool({
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DB,
  });

  const schemaPath = path.join(__dirname, '../sql/postgres_schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schemaSql);
  await pool.query('DELETE FROM products');

  const batchSize = 1000;
  for (let start = 1; start <= N_PRODUCTS; start += batchSize) {
    const end = Math.min(start + batchSize - 1, N_PRODUCTS);
    const values = [];
    const valueGroups = [];
    let paramIndex = 1;

    for (let i = start; i <= end; i++) {
      const p = makeProduct(i);
      valueGroups.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      values.push(p.id, p.name, p.price, p.stock, p.created_at);
    }

    const sql =
      'INSERT INTO products (id, name, price, stock, created_at) VALUES ' +
      valueGroups.join(',');
    await pool.query(sql, values);
    console.log(`Postgres inserted up to ${end}`);
  }

  await pool.end();
}

async function seedMongo() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(MONGO_DB_NAME);
  const col = db.collection('products');

  await col.deleteMany({});

  const batchSize = 1000;
  for (let start = 1; start <= N_PRODUCTS; start += batchSize) {
    const end = Math.min(start + batchSize - 1, N_PRODUCTS);
    const docs = [];
    for (let i = start; i <= end; i++) {
      const p = makeProduct(i);
      docs.push({
        _id: p.id,
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        created_at: p.created_at,
      });
    }
    await col.insertMany(docs);
    console.log(`Mongo inserted up to ${end}`);
  }

  await client.close();
}

async function main() {
  console.log('Seeding MySQL...');
  await seedMysql();
  console.log('Seeding Postgres...');
  await seedPostgres();
  console.log('Seeding Mongo...');
  await seedMongo();
  console.log('Seeding done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
