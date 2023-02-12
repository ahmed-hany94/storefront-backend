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
    throw new Error(DATABASE_STATUS_MESSAGES.connection_failed);
  }
};

const releaseClient = async function (client: PoolClient) {
  client.release();
};

const connect_db = async function (): Promise<boolean> {
  const client = await getConnection();
  if (Object.keys(client).length) {
    console.log(DATABASE_STATUS_MESSAGES.database_init_success);
    releaseClient(client);
    return true;
  } else {
    console.log(DATABASE_STATUS_MESSAGES.database_init_failed);
    releaseClient(client);
    return false;
  }
};

const selectOneQuery = async function <T>(query: string, params: string[]) {
  try {
    const client = await getConnection();
    return client
      .query<T[]>(query, params)
      .then((res) => {
        const rows: T[][] = res.rows;

        if (rows.length === 0) {
          throw Error(DATABASE_STATUS_MESSAGES.select_success_but_empty);
        }

        releaseClient(client);
        return rows[0] as T;
      })
      .catch((err) => {
        releaseClient(client);
        console.log(err);
        throw Error(DATABASE_STATUS_MESSAGES.select_failed);
      });
  } catch (err) {
    console.log(err);
    return {} as T;
  }
};

const selectManyQuery = async function <T>(query: string, params: string[]) {
  try {
    const client = await getConnection();
    return client
      .query<T[]>(query, params)
      .then((res) => {
        if (res.rows.length === 0) {
          throw Error(DATABASE_STATUS_MESSAGES.select_success_but_empty);
        }

        releaseClient(client);
        return res.rows as T;
      })
      .catch((err) => {
        releaseClient(client);
        console.log(err);
        throw Error(DATABASE_STATUS_MESSAGES.select_failed);
      });
  } catch (err) {
    console.log(err);
    return {} as T;
  }
};

const selectAllQuery = async function <T>(query: string) {
  const client = await getConnection();
  return client
    .query<T[]>(query)
    .then((res) => {
      if (res.rows.length === 0) {
        throw Error(DATABASE_STATUS_MESSAGES.select_success_but_empty);
      }

      releaseClient(client);
      return res.rows as T[];
    })
    .catch((err) => {
      releaseClient(client);
      console.log(err);
      return [];
    });
};

const insertQuery = async function (
  query: string,
  params: (string | number)[]
): Promise<string> {
  try {
    const client = await getConnection();
    return client
      .query(query, params)
      .then(() => {
        releaseClient(client);
        return DATABASE_STATUS_MESSAGES.insert_success;
      })
      .catch((err) => {
        if (err.code === '23505') {
          releaseClient(client);
          return err.message;
        } else {
          releaseClient(client);
          return DATABASE_STATUS_MESSAGES.insert_failed;
        }
      });
  } catch (err) {
    return DATABASE_STATUS_MESSAGES.insert_failed;
  }
};

const updateQuery = async function (query: string, params: string[]) {
  const client = await getConnection();
  return client
    .query(query, params)
    .then(() => {
      releaseClient(client);
      return DATABASE_STATUS_MESSAGES.update_success;
    })
    .catch((err) => {
      console.log(err);
      releaseClient(client);
      return DATABASE_STATUS_MESSAGES.update_failed;
    });
};

const deleteQuery = async function (query: string, params: string[]) {
  const client = await getConnection();
  return client
    .query(query, params)
    .then(() => {
      releaseClient(client);
      return DATABASE_STATUS_MESSAGES.delete_success;
    })
    .catch((err) => {
      console.log(err);
      releaseClient(client);
      return DATABASE_STATUS_MESSAGES.delete_failed;
    });
};

const truncateQuery = async function (query: string): Promise<string> {
  try {
    const client = await getConnection();
    return client
      .query(query)
      .then(() => {
        releaseClient(client);
        return DATABASE_STATUS_MESSAGES.tuncation_success;
      })
      .catch((err) => {
        console.log(err.message);
        releaseClient(client);
        return DATABASE_STATUS_MESSAGES.tuncation_failed;
      });
  } catch (err) {
    console.log(err);
    return DATABASE_STATUS_MESSAGES.tuncation_failed;
  }
};

export {
  connect_db,
  deleteQuery,
  insertQuery,
  selectAllQuery,
  selectManyQuery,
  selectOneQuery,
  truncateQuery,
  updateQuery
};
