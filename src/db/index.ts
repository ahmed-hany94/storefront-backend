import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { UserSchema } from '../models/User';
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

interface IUser extends QueryResultRow {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  hash: string;
}

const selectOne = async function (
  query: string,
  params: string[]
): Promise<IUser[] | void> {
  try {
    const client = await getConnection();
    return client
      .query<IUser[]>(query, params)
      .then((res) => {
        const rows: IUser[][] = res.rows;

        if (rows.length === 0)
          throw Error(DATABASE_STATUS_MESSAGES.select_success_but_empty);

        return rows[0];
      })
      .catch((err) => {
        console.log(err);
        throw Error(DATABASE_STATUS_MESSAGES.select_failed);
      });
  } catch (err) {
    console.log(err);
    throw Error(DATABASE_STATUS_MESSAGES.select_failed);
  }
};

const selectAll = async function (query: string): Promise<IUser[][] | void> {
  try {
    const client = await getConnection();
    return client
      .query<IUser[]>(query)
      .then((res) => {
        const rows: IUser[][] = res.rows;

        if (rows.length === 0)
          throw Error(DATABASE_STATUS_MESSAGES.select_success_but_empty);

        return rows;
      })
      .catch((err) => {
        console.log(err);
        throw Error(DATABASE_STATUS_MESSAGES.select_failed);
      });
  } catch (err) {
    console.log(err);
    throw Error(DATABASE_STATUS_MESSAGES.select_failed);
  }
};

const selectQuery = async function (query: string, params: string[]) {
  try {
    const client = await getConnection();
    client
      .query(query, params)
      .then((res) => {
        if (res.rows.length) {
          return res;
        }
        // TODO: check this
        // else {
        //   return { error: DATABASE_STATUS_MESSAGES.select_success_but_empty };
        // }
      })
      .catch((err) => {
        console.log(err);
        throw Error(DATABASE_STATUS_MESSAGES.select_failed);
      });
  } catch (err) {
    console.log(err);
    throw Error(DATABASE_STATUS_MESSAGES.select_failed);
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
  const client = await getConnection();
  if (Object.keys(client).length) {
    console.log('Database Initialized Successfully');
    client.release();
    return true;
  } else {
    console.log('Database Initialization failed');
    return false;
  }
};

const releaseClient = async function () {
  const client = await getConnection();
  client.release();
};

export {
  connect_db,
  getConnection,
  insertQuery,
  releaseClient,
  selectQuery,
  selectAll,
  selectOne
};
