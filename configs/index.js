import * as dotenv from 'dotenv';
dotenv.config();
// some simple project configs
const Configs = {
  cors: {
    'origin': process.env.ORIGIN,
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'optionsSuccessStatus': 204,
  },
  httpPort: process.env.HTTPPORT,
  socketPort: process.env.SOCKETPORT,
};
export {Configs};
