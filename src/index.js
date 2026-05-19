const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

let tasks = [];

app.get('/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime() }));

app.get('/tasks', (req, res) => res.json(tasks));

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const task = { id: uuidv4(), title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  res.json(task);
});

app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'not found' });
  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  tasks.splice(idx, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
if (require.main === module)
  app.listen(PORT, () => console.log('Running on port ' + PORT));

module.exports = app;