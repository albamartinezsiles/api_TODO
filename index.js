const express = require("express");
require('dotenv').config();
const servidor = express();


servidor.listen(process.env.PORT);