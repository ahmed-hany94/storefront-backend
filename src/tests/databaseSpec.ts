import {
  insertQuery,
  selectAllQuery,
  selectOneQuery,
  truncateQuery,
  updateQuery
} from '../db';
import { OrderSchema } from '../models/Order';
import { OrderProductSchema } from '../models/OrderProduct';
import { ProductSchema } from '../models/Product';
import { UserSchema } from '../models/User';
import { DATABASE_STATUS_MESSAGES } from '../modules/constants';

const USER_DATA = {
  username: 'tst',
  firstname: 'testname',
  lastname: 'testlastname',
  hash: 'test_passwd'
};
let user1_id: string;

const PRODUCT_DATA = {
  name: 'prod',
  price: 9.99
};
let prod_id: string;
let order_id: string;

// **********************************************
// User's Test Cases
// **********************************************
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
  // Products's Test Cases
  // **********************************************
  it('Should create product', async () => {
    // Start with a clean slate
    await truncateQuery('TRUNCATE TABLE products CASCADE;');

    const query = 'INSERT INTO "products" (name, price) VALUES ($1, $2);';
    const params = [PRODUCT_DATA.name, PRODUCT_DATA.price];
    const operationMessage = await insertQuery(query, params);
    expect(operationMessage).toBe(DATABASE_STATUS_MESSAGES.insert_success);
  });

  // **********************************************

  it('Should get all products', async () => {
    const query = 'SELECT * FROM "products";';
    const operationResult = await selectAllQuery<ProductSchema>(query);
    prod_id = operationResult[0].prod_id;
    expect(operationResult[0].name).toBe(PRODUCT_DATA.name);
    const priceFloat = parseFloat(
      operationResult[0].price as unknown as string
    );
    expect(priceFloat).toBe(PRODUCT_DATA.price);
  });

  // **********************************************
  // Order's Test Cases
  // **********************************************

  it('Should create order', async () => {
    // Start with a clean slate
    await truncateQuery('TRUNCATE TABLE orders CASCADE;');

    const query = 'INSERT INTO "orders" (status, user_id) VALUES ($1, $2);';
    const params = ['active', user1_id];
    const operationMessage = await insertQuery(query, params);
    expect(operationMessage).toBe(DATABASE_STATUS_MESSAGES.insert_success);
  });

  // **********************************************

  it('Should get all products', async () => {
    const query = 'SELECT * FROM "orders";';
    const operationResult = await selectAllQuery<OrderSchema>(query);
    order_id = operationResult[0].order_id;
    expect(operationResult[0].status).toBe('active');
    expect(operationResult[0].user_id).toBe(user1_id);
  });

  // **********************************************
  // OrderProduct's Test Cases
  // **********************************************

  it('Should create orderProduct', async () => {
    const query =
      'INSERT INTO "order_products" (quantity, order_id, product_id) VALUES ($1, $2, $3);';
    const params = [3, order_id, prod_id];
    const operationMessage = await insertQuery(query, params);
    expect(operationMessage).toBe(DATABASE_STATUS_MESSAGES.insert_success);
  });

  it('Should get all products', async () => {
    const query = 'SELECT * FROM "order_products";';
    const operationResult = await selectAllQuery<OrderProductSchema>(query);
    expect(operationResult[0].quantity).toBe(3);
    expect(operationResult[0].order_id).toBe(order_id);
    expect(operationResult[0].product_id).toBe(prod_id);
  });
});
