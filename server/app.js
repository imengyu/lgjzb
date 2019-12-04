const express = require('express')
const app = express()
const bodyParser = require('body-parser');

const database = require("./utils/database");
const logger = require("./utils/logger");

const userContoller = require("./controller/userContoller");
const defaultController = require("./controller/defaultController");
const jobsController = require("./controller/jobsController");
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis')

let client = redis.createClient()


app.use(bodyParser.json());
app.use(session({
  cookie: {
    maxAge: 640000
  },
  secret: 'lgjzb_server',
  store: new RedisStore({
    client: client,
    host: '127.0.0.1',
    port: '6379',
    ttl: 60 * 60 * 24 * 30, 
    prefix: 'ss',
  }),
  saveUninitialized: false,
  resave: false,
}));

userContoller.createRoutes(app);
defaultController.createRoutes(app);
jobsController.createRoutes(app);

app.listen(3010, () => logger.info('[Server] App listening on port 3010!'))
app.all('/*', function(req, res, next){
  logger.info(`[Request] ${req.method} ${req.url} / ${req.ip}`);
  next();
});
