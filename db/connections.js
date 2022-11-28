import {logger} from '../modules/logger/winston.js';
import mongoose from 'mongoose';
import {Player} from '../models/player.model';
import {Role} from '../models/role.model';
// import logger from "../modules/logger";
// const mongoose = require('mongoose');
const db = {};
db.Player = Player;
db.Role = Role;
db.init = () => {
  mongoose.connect('mongodb://localhost:27017/test-mongo');
  db.mongoose = mongoose.connection;
  // Bind connection to error event (to get notification of connection errors)

  db.mongoose.on('error', (err)=>{
    logger.log({level: 'error', message: 'MongoDB connection error:'} );
    console.error('MongoDB connection error:');
  });
};


export {db};
