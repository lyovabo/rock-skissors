import mongoose from 'mongoose';

const Player = mongoose.model(
    'Player',
    new mongoose.Schema({
      username: String,
      password: String,
      roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
    }),
);
export {Player};
