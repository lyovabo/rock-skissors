
import mongoose from "mongoose"

import { Role } from "../models/role.model";
// import logger from "../modules/logger";
mongoose.connect('mongodb://localhost:27017/test-mongo');
Role.findOneAndUpdate({name: "player"}).then(res => {
    console.log(res);
});
