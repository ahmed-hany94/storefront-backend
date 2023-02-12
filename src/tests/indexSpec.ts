import supertest from 'supertest';

import { USER_STATUS_MESSAGES } from '../modules/constants';
import { app } from '../server';

const request = supertest(app);

let TOKEN = '';
let UID = '';
let PROD_ID_1 = '';
let PROD_ID_2 = '';

describe('Test endpoint responses', () => {
  it('Should create user', async () => {
    const res = await request
      .post('/api/users')
      .send({
        username: 'user_username',
        firstName: 'user_first_name',
        lastName: 'user_last_name',
        password: 'user_password'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.message).toBe(USER_STATUS_MESSAGES.user_created_success);
  });

  it('Should login user', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({
        username: 'user_username',
        password: 'user_password'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    TOKEN = res.body.token;
  });

  it('Should get all users', async () => {
    const res = await request
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);

    UID = res.body.users[1].user_id;
  });

  it('Should get a user by specific id', async () => {
    await request
      .get(`/api/users/${UID}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('Should create product', async () => {
    await request
      .post(`/api/products`)
      .send({
        name: 'product1',
        price: 9.99
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('Should create another product', async () => {
    await request
      .post(`/api/products`)
      .send({
        name: 'product2',
        price: 99.99
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('Should get all products', async () => {
    const res = await request
      .get(`/api/products`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);

    PROD_ID_1 = res.body.products[1].prod_id;
    PROD_ID_2 = res.body.products[2].prod_id;
  });

  it('Should get product by id', async () => {
    const res = await request
      .get(`/api/products/${PROD_ID_1}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.product.name).toBe('product1');
    expect(res.body.product.price).toBe('9.99');
  });

  it('Should create an order', async () => {
    const res = await request
      .post(`/api/users/${UID}/orders`)
      .send({
        items: [
          {
            product_id: `${PROD_ID_1}`,
            quantity: 3
          }
        ],
        status: 'active'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.message).toBe(
      'Order Creation Successful, OrderProduct Creation Successful'
    );
  });

  it('Should get active orders', async () => {
    const res = await request
      .get(`/api/users/${UID}/orders/active`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.order[0].name).toBe('product1');
    expect(res.body.order[0].price).toBe('9.99');
    expect(res.body.order[0].status).toBe('active');
    expect(res.body.order[0].quantity).toBe(3);
  });

  it('Should complete order', async () => {
    const res = await request
      .post(`/api/users/${UID}/orders`)
      .send({
        items: [
          {
            product_id: `${PROD_ID_2}`,
            quantity: 5
          }
        ],
        status: 'complete'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.message).toBe(
      'Order Update Successful, OrderProduct Update Successful'
    );
  });

  it('Should get complete orders', async () => {
    const res = await request
      .get(`/api/users/${UID}/orders/completed`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.order[0].name).toBe('product1');
    expect(res.body.order[0].price).toBe('9.99');
    expect(res.body.order[0].status).toBe('complete');
    expect(res.body.order[0].quantity).toBe(3);

    expect(res.body.order[1].name).toBe('product2');
    expect(res.body.order[1].price).toBe('99.99');
    expect(res.body.order[1].status).toBe('complete');
    expect(res.body.order[1].quantity).toBe(5);
  });
});
