import { Pool, PoolClient, PoolConfig } from 'pg';
import {
  DB_PORT,
  POSTGRES_DB_NAME,
  POSTGRES_TEST_DB_NAME,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  ENV
} from '../constants';

const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: ENV !== 'test' ? POSTGRES_DB_NAME : POSTGRES_TEST_DB_NAME,
  port: parseInt(DB_PORT || '5432')
} as PoolConfig);

const getConnection = async function (): Promise<PoolClient> {
  try {
    let client = await pool.connect();
    return client;
  } catch (err) {
    console.log(err);
    return {} as PoolClient;
  }
};

const connect_db = async function (): Promise<Boolean> {
  try {
    let client = await pool.connect();
    console.log('Database Connected Successfully');
    client.release();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export { connect_db, getConnection };
