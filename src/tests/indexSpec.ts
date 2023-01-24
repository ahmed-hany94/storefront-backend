import supertest from 'supertest';
import { USER_STATUS_MESSAGES } from '../modules/constants';
import { app } from '../server';

const request = supertest(app);

let TOKEN = '';
let UID = '';
let PROD_ID = '';
let ORDER_ID = '';

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

    expect(res.body.message).toBe(USER_STATUS_MESSAGES.user_created_succes);
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

    TOKEN = res.body.message;
  });
});
