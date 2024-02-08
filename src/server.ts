import app from './app';
import config from './app/config';
import mongoose from 'mongoose';
import { Server } from 'http';
import seedSupperAdmin from './app/DB';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
     seedSupperAdmin();
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
process.on('unhandledRejection', (err) => {
  console.log(`😡 Unhandle Rejection is Detected  Server is Close Emideatly `, err);
  if (server) {
    server.close(() => {
      process.exit(1); //Gressfully off server Asyncronus handle
    });
  }
});

// for async code
// Promise.reject();

//for sync code
process.on('uncaughtException', (err) => {
  console.log(`👺 uncaughtException is Detected  Server is Close Emideatly `, err);
  process.exit(1);
});

// for sync code
// console.log(x);df
