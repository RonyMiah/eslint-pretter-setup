import express, { Application, RequestHandler } from 'express';
import cors from 'cors';
import globalErrorHandaller from './app/middlwares/globalErrorHandaller';
import notFound from './app/middlwares/notFound';
import router from './app/routes';
const app: Application = express();

//parser
app.use(express.json());
app.use(cors());

//Application Route
app.use('/api/v1', router);

const test: RequestHandler = (req, res) => {
  res.send('Hello world');
};

app.get('/', test);
//notfound route
app.use(notFound);
//Global Error handaller
app.use(globalErrorHandaller);

export default app;
