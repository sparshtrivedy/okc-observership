import express from 'express';
import cors from 'cors';
import applicantsRouter from './routes/applicants.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'okc-usce-server' });
});

app.use('/api/applicants', applicantsRouter);

app.listen(port, () => {
  console.log(`OKC USCE backend listening on http://localhost:${port}`);
});
