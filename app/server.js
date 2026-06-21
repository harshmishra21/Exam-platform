const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory dummy exam data (replace with RDS/Postgres in production)
const exams = [
  { id: 1, title: 'DevOps Fundamentals', duration: 60 },
  { id: 2, title: 'Cloud Architecture', duration: 90 }
];

app.get('/', (req, res) => {
  res.json({ message: 'Online Examination Platform API is running' });
});

// Liveness probe endpoint (used by Kubernetes)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness probe endpoint (used by Kubernetes)
app.get('/readyz', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.get('/api/exams', (req, res) => {
  res.json(exams);
});

app.post('/api/exams/:id/submit', (req, res) => {
  const examId = parseInt(req.params.id);
  const exam = exams.find(e => e.id === examId);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json({ message: `Exam ${examId} submitted successfully`, answers: req.body });
});

app.listen(PORT, () => {
  console.log(`Exam platform backend running on port ${PORT}`);
});
