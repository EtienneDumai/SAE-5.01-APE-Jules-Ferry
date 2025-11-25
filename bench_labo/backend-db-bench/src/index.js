import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import pkg from 'pg';
import { MongoClient } from 'mongodb';

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// ====== ENV / CONFIG (adapté à ton docker-compose) ======
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

// ====== POOLS CONNEXION ======
const mysqlPool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

const pgPool = new Pool({
  host: PG_HOST,
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DB,
});

const mongoClient = new MongoClient(MONGO_URL);
let mongoDb;

async function initMongo() {
  await mongoClient.connect();
  mongoDb = mongoClient.db(MONGO_DB_NAME);
  console.log('Mongo connected');
}
initMongo().catch(console.error);

// ====== UTIL ======
function parseLimitOffset(req) {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
  return { limit, offset };
}

// ====== ROUTES BENCH ======

// MySQL
app.get('/mysql/products', async (req, res) => {
  const { limit, offset } = parseLimitOffset(req);
  try {
    const [rows] = await mysqlPool.query(
      'SELECT id, name, price, stock, created_at FROM products ORDER BY id LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    console.error('MySQL error:', err);
    res.status(500).json({ error: 'MySQL error' });
  }
});

// PostgreSQL
app.get('/postgres/products', async (req, res) => {
  const { limit, offset } = parseLimitOffset(req);
  try {
    const result = await pgPool.query(
      'SELECT id, name, price, stock, created_at FROM products ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Postgres error:', err);
    res.status(500).json({ error: 'Postgres error' });
  }
});

// MongoDB
app.get('/mongo/products', async (req, res) => {
  const { limit, offset } = parseLimitOffset(req);
  try {
    const docs = await mongoDb
      .collection('products')
      .find({})
      .sort({ id: 1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    res.json(docs);
  } catch (err) {
    console.error('Mongo error:', err);
    res.status(500).json({ error: 'Mongo error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('DB bench app listening on port ' + port);
