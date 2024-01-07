import express, { Application, RequestHandler } from 'express';
import cors from 'cors';
import globalErrorHandaller from './app/middlwares/globalErrorHandaller';
import notFound from './app/middlwares/notFound';
import router from './app/routes';
import cookieParser from 'cookie-parser';
const app: Application = express();

//parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5170'] }));

//Application Route
app.use('/api/v1', router);

const test: RequestHandler = async (req, res) => {
  res.send('Hello world');
};

app.get('/', test);
//notfound route
app.use(notFound);
//Global Error handaller
app.use(globalErrorHandaller);

export default app;
