const mongoose = require('mongoose');
const request = require('supertest');

const server = require('../../../../server');
const { loginAdmin } = require('../../helpers/loginAdmin');

let token;
let pin;

describe('employeeLogout', () => {
  beforeAll(async (done) => {
    loginAdmin(server)
      .then(async resToken => {
        token = resToken;
        request(server)
          .post('/api/employees/register')
          .set('Authorization', token)
          .send({
            name: 'Fred Fredson',
            pass: 'password'
          })
          .then(response => {
            pin = response.body.pin; // eslint-disable-line
            return request(server)
              .post('/api/employees/login')
              .set('Authorization', token)
              .send({
                pin
              })
              .then((loginRes) => {
                token = loginRes.body.token; //eslint-disable-line
                done();
              });
          })
          .catch(err => {
            console.error(err);
          });
      }).catch(err => {
        console.error(err);
      });
  });

  afterAll((done) => {
    mongoose.connection.db.dropDatabase(done);
    mongoose.disconnect();
  });

  // Valid
  it('[Auth] GET: Works with a token', async () => {
    console.log(token, pin);
    const res = await request(server)
      .get('/api/employees/logout')
      .set('Authorization', `${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // Invalid
  it('GET: Does not work without a token', async () => {
    const res = await request(server)
      .get('/api/employees/logout');
    expect(res.status).toBe(500);
  });
});