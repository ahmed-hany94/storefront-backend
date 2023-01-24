import { Pool, PoolClient, PoolConfig } from 'pg';
import {
  DB_PORT,
  POSTGRES_DB_NAME,
  POSTGRES_TEST_DB_NAME,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  ENV,
  DATABASE_STATUS_MESSAGES
} from '../modules/constants';

const selectQuery = async function (query: string, params: string[]) {
  try {
    const client = await getConnection();
    client
      .query(query, params)
      .then((res) => {
        if (res.rows.length) {
          return res;
        } else {
          return { error: DATABASE_STATUS_MESSAGES.select_success_but_empty };
        }
      })
      .catch((err) => {
        return { error: err.message };
      });
  } catch (err) {
    console.log(err);
    return { error: DATABASE_STATUS_MESSAGES.select_failed };
  }
};

const insertQuery = async function (
  query: string,
  params: string[]
): Promise<string> {
  try {
    const client = await getConnection();
    return client
      .query(query, params)
      .then(() => {
        return DATABASE_STATUS_MESSAGES.insert_success;
      })
      .catch((err) => {
        if (err.code === '23505') {
          return `${DATABASE_STATUS_MESSAGES.insert_failed_unique_violation} ${err.message}`;
        } else {
          return DATABASE_STATUS_MESSAGES.insert_failed;
        }
      });
  } catch (err) {
    return DATABASE_STATUS_MESSAGES.insert_failed;
  }
};

const getConnection = async function (): Promise<PoolClient> {
  try {
    const pool = new Pool({
      host: POSTGRES_HOST,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database:
        ENV!.trim() !== 'test' ? POSTGRES_DB_NAME : POSTGRES_TEST_DB_NAME,
      port: parseInt(DB_PORT || '5432')
    } as PoolConfig);

    const client = await pool.connect();
    return client;
  } catch (err) {
    console.log(err);
    return {} as PoolClient;
  }
};

const connect_db = async function (): Promise<Boolean> {
  try {
    const client = await getConnection();
    console.log('Database Connected Successfully');
    client.release();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const releaseClient = async function () {
  const client = await getConnection();
  client.release();
};

export { connect_db, getConnection, insertQuery, releaseClient, selectQuery };
