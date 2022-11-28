import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import {Player} from '../../models/player.model';
import {Role} from '../../models/role.model';

const secret = process.env.SECRET;

const verifyToken = (socket, next) => {
  const token = socket.handshake.auth.token;
  socket.user = {};
  if (!token) {
    const error = new Error();
    error.status = 403;
    error.message = 'No token provided!';
    next(error);
  }
  try {
    const decoded = jwt.verify(token, secret);
    // console.log('userId', decoded);
    socket.user = {
      id: decoded.id,
      username: decoded.username,
    };
  } catch (err) {
    console.log('error verify', err);
    const error = new Error();
    error.status = 401;
    error.message = 'Unauthorized!';
    next(error);
  }
};

const signup = (req, res) => {
  const player = new Player({
    username: req.body.userName,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  player.save((err, player) => {
    if (err) {
      res.status(500).send({message: err});
      return;
    }

    if (req.body.roles) {
      Role.find(
          {
            name: {$in: req.body.roles},
          },
          (err, roles) => {
            if (err) {
              res.status(500).send({message: err});
              return;
            }

            player.roles = roles.map((role) => role._id);
            player.save((err) => {
              if (err) {
                res.status(500).send({message: err});
                return;
              }
              logger.log({level: 'info',
                message: `Player ${player.username} was 
                registered ${time.now()}`} );
              res.send({message: 'player was registered successfully!'});
              // ToDo: generate token and put it here too
            });
          },
      );
    } else {
      Role.findOne({name: 'player'}, (err, role) => {
        if (err) {
          res.status(500).send({message: err});
          return;
        }
        player.roles = [role._id];
        player.save((err) => {
          if (err) {
            res.status(500).send({message: err});
            return;
          }
          logger.log({level: 'info',
            message: `Player ${player.username} was 
                registered ${time.now()}`} );
          res.send({message: 'player was registered successfully!'});
        });
      });
    }
  });
};


const signin = (req, res, next) => {
  Player.findOne({
    username: req.body.userName,
  })
      .populate('roles', '-__v')
      .exec((err, player) => {
        if (err) {
          res.status(500).send({message: err});
          return;
        }

        // console.log(!player);
        if (!player) {
          return signup(req, res, next);
          // return res.status(404).send({ message: "player Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            player.password,
        );
        if (!passwordIsValid) {
          return res.status(401).send({
            token: null,
            message: 'Invalid Username or Password!',
          });
        }

        const token = jwt.sign({id: player.id, username: player.username},
            secret, {
              expiresIn: 86400, // 24 hours
            });

        const authorities = [];

        for (let i = 0; i < player.roles.length; i++) {
          authorities.push('ROLE_' + player.roles[i].name.toUpperCase());
        }
        res.setHeader('Access-Control-Allow-Origin', '*')
            .status(200).send({
              username: player.username,
              roles: authorities,
              token: token,
            });
        logger.log({level: 'info',
          message: `Player ${player.username}
          logged in at: ${time.now()}`} );
        next();
      });
};

export {signin, signup, verifyToken};
