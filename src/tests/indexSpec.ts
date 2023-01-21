import supertest from 'supertest';
import { app } from '../server';

const request = supertest(app);

describe('Test endpoint responses', () => {
  it('Should get the home', async () => {
    await request.get('/').expect(200);
  });
});
