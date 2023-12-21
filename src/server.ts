import app from './app';
import config from './app/config';
import mongoose from 'mongoose';
import { Server } from 'http';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`ExampleApp are listening port on ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

//process listen when unhandel error and uncought error is here .
//for async code
process.on('unhandledRejection', () => {
  console.log(`😡 Unhandle Rejection is Detected  Server is Close Emideatly `);
  if (server) {
    server.close(() => {
      process.exit(1); //Gressfully off server Asyncronus handle
    });
  }
});

// for async code
// Promise.reject();

//for sync code
process.on('uncaughtException', () => {
  console.log(`👺 uncaughtException is Detected  Server is Close Emideatly `);
  process.exit(1);
});

// for sync code
// console.log(x);df
