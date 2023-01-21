import { Pool, PoolConfig } from 'pg';
import {
  DB_PORT,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER
} from '../constants';

const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  port: parseInt(DB_PORT || '5432')
} as PoolConfig);

const create_db = async () => {};

const connect_db = async (): Promise<Boolean> => {
  try {
    await pool.connect();
    console.log('Database Connected Successfully');
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export { connect_db };
