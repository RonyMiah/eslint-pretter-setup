import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { StudentRoutes } from './app/Module/student/student.route';
const app: Application = express();

//parser
app.use(express.json());
app.use(cors());

//Application Route
app.use('/api/v1/students', StudentRoutes);

const getAController = (req: Request, res: Response) => {
  res.send('Hello world');
};

app.get('/', getAController);

export default app;
