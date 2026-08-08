import 'dotenv/config';
import express, { Request, Response } from 'express';
import authRoutes from './routes/auth.routes';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running' });
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});