import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running' });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
