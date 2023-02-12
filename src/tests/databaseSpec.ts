import {
  insertQuery,
  selectAllQuery,
  selectOneQuery,
  truncateQuery,
  updateQuery
} from '../db';
import { UserSchema } from '../models/User';
import { DATABASE_STATUS_MESSAGES } from '../modules/constants';

const USER_DATA = {
  username: 'tst',
  firstname: 'testname',
  lastname: 'testlastname',
  hash: 'test_passwd'
};
let user1_id: string;

// **********************************************
// Test Cases

describe('Test database queries', () => {
  it('Should create user', async () => {
    // Start with a clean slate
    await truncateQuery('TRUNCATE TABLE users CASCADE;');

    const query =
      'INSERT INTO "users" (username, firstname, lastname, hash) VALUES ($1, $2, $3, $4);';
    const params = [
      USER_DATA.username,
      USER_DATA.firstname,
      USER_DATA.lastname,
      USER_DATA.hash
    ];
    const operationMessage = await insertQuery(query, params);
    expect(operationMessage).toBe(DATABASE_STATUS_MESSAGES.insert_success);
  });

  // **********************************************

  it("Shouldn't create the same user", async () => {
    const query =
      'INSERT INTO "users" (username, firstname, lastname, hash) VALUES ($1, $2, $3, $4);';
    const params = [
      USER_DATA.username,
      USER_DATA.firstname,
      USER_DATA.lastname,
      USER_DATA.hash
    ];
    const operationMessage = await insertQuery(query, params);
    console.log(operationMessage);
    expect(operationMessage).toBe(
      `${DATABASE_STATUS_MESSAGES.insert_failed_unique_violation} "users_username_key"`
    );
  });

  // **********************************************
  it('Should select all users', async () => {
    const query = 'SELECT * FROM "users";';
    const operationResult = await selectAllQuery<UserSchema>(query);
    user1_id = operationResult[0].user_id;
    expect(operationResult[0].username).toBe(USER_DATA.username);
    expect(operationResult[0].firstname).toBe(USER_DATA.firstname);
    expect(operationResult[0].lastname).toBe(USER_DATA.lastname);
  });

  // **********************************************
  it('Should select a specific user by id', async () => {
    const query = 'SELECT * FROM "users" WHERE user_id = $1;';
    const operationResult = await selectOneQuery<UserSchema>(query, [user1_id]);
    expect(operationResult.username).toBe(USER_DATA.username);
    expect(operationResult.firstname).toBe(USER_DATA.firstname);
    expect(operationResult.lastname).toBe(USER_DATA.lastname);
  });

  // **********************************************
  it("Should update user's username", async () => {
    const query = 'UPDATE users SET username = $1 WHERE user_id = $2';
    await updateQuery(query, ['tst2', user1_id]);
    const userThatGotUpdated = await selectOneQuery<UserSchema>(
      'SELECT * FROM "users" WHERE user_id = $1;',
      [user1_id]
    );

    expect(userThatGotUpdated.username).toBe('tst2');
    USER_DATA.username = 'tst2';
  });

  // **********************************************
});
