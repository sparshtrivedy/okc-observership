import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import applicantsRouter from './routes/applicants.js';
import adminRouter from './routes/admin.js';
import studentRouter from './routes/student.js';
import { ensureBootstrapAdmin } from './services/adminService.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'okc-usce-server' });
});

app.use('/api/applicants', applicantsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/student', studentRouter);

async function startServer() {
  try {
    await ensureBootstrapAdmin();
    app.listen(port, () => {
      console.log(`OKC USCE backend listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
