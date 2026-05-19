const request = require('supertest');
const app = require('../src/index');

describe('Task API', () => {
  let taskId;

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /tasks returns array', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /tasks creates a task', async () => {
    const res = await request(app)
      .post('/tasks').send({ title: 'Buy milk' });
    expect(res.statusCode).toBe(201);
    taskId = res.body.id;
  });

  test('GET /tasks/:id gets task', async () => {
    const res = await request(app).get('/tasks/' + taskId);
    expect(res.statusCode).toBe(200);
  });

  test('PUT /tasks/:id updates task', async () => {
    const res = await request(app)
      .put('/tasks/' + taskId).send({ done: true });
    expect(res.body.done).toBe(true);
  });

  test('DELETE /tasks/:id deletes task', async () => {
    const res = await request(app).delete('/tasks/' + taskId);
    expect(res.statusCode).toBe(204);
  });

  test('POST without title returns 400', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.statusCode).toBe(400);
  });
});