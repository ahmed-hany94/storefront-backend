import { insertQuery, releaseClient } from '../db';
import { DATABASE_STATUS_MESSAGES } from '../modules/constants';

describe('Test database queries', () => {
  it('Should create user', async () => {
    const query =
      'INSERT INTO "users" (username, firstname, lastname, hash) VALUES ($1, $2, $3, $4);';
    const params = ['tst', 'testname', 'testlastname', 'test_passwd'];
    const operationMessage = await insertQuery(query, params);
    expect(operationMessage).toBe(DATABASE_STATUS_MESSAGES.insert_success);
  });

  it("Shouldn't create the same user", async () => {
    const query =
      'INSERT INTO "users" (username, firstname, lastname, hash) VALUES ($1, $2, $3, $4);';
    const params = ['tst', 'testname', 'testlastname', 'test_passwd'];
    const operationMessage = await insertQuery(query, params);
    expect(operationMessage).toBe(DATABASE_STATUS_MESSAGES.insert_failed);
  });

  releaseClient();
});
