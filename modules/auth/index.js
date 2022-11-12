import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { Player } from "../../models/player.model"
import { Role } from "../../models/role.model"
import { Configs } from "../../configs"

// const verifyToken = (req, res, next) => {
  const verifyToken = (socket, next) => {
    const req = socket.request;
    let token = req.headers["access-token"];
    

    if (!token) {
      const error = new Error("not authorized");
      error.data = {"status":403, "message": "No token provided!"};
      next(error);
      // return res.status(403).send({ message: "No token provided!" });
      
    } 
    try { 
      const decoded = jwt.verify(token, Configs.secret);
      req.userId = decoded.id;
      console.log("userId");  
    } 
      catch (err) {
        const error = new Error("not authorized");
        error.data = {"status":401, "message": "Unauthorized!"};
        next(error);
      }
      
    
    next();
   
      
  };

const signup = (req, res) => {
    const player = new Player({
      username: req.body.userName,
      password: bcrypt.hashSync(req.body.password, 8)
    });
  
    player.save((err, player) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
  
      if (req.body.roles) {
        Role.find(
          {
            name: { $in: req.body.roles }
          },
          (err, roles) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
  
            player.roles = roles.map(role => role._id);
            player.save(err => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }
  
              res.send({ message: "player was registered successfully!" });
              // ToDo: generate token and put it here too
            });
          }
        );
      } else {
        Role.findOne({ name: "player" }, (err, role) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
  
          player.roles = [role._id];
          player.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
  
            res.send({ message: "player was registered successfully!" });
          });
        });
      }
    });
  };
  


  const signin = (req, res, next) => {
    let token = req.headers["access-token"];
    try { 
      console.log(req.cookies)
      const decoded = jwt.verify(token, Configs.secret);
      
      console.log("userId: "+decoded.userId);  
    } catch(err) {
        console.log(err)
    }
    Player.findOne({
      username: req.body.userName
    })
      .populate("roles", "-__v")
      .exec((err, player) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        
        console.log(!player)
        if (!player) {
            return signup(req, res, next);
            // return res.status(404).send({ message: "player Not found." });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          player.password
        );
          console.log("password is valid?: "+passwordIsValid);
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Username or Password!"
          });
        }
  
        const token = jwt.sign({ id: player.id }, Configs.secret, {
          expiresIn: 86400 // 24 hours
        });
  
        const authorities = [];
  
        for (let i = 0; i < player.roles.length; i++) {
          authorities.push("ROLE_" + player.roles[i].name.toUpperCase());
        }
        res.cookie('access-token', token, {
          httpOnly: true,
          secure: false,
         
         
        }).setHeader("Access-Control-Allow-Origin",  "*")
        .status(200).send({
          id: player._id,
          username: player.username,
          roles: authorities,
        });
        // next();
      });
  };

  export {signin, signup, verifyToken};