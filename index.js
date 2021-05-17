var
  express = require('express'),
  cors = require('cors');


require("dotenv").config();


// Create global app object
var app = express();

app.use(cors());




const { auth, requiresAuth } = require('express-openid-connect');
app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    idpLogout: true,
  })
);
require("./routes/auth")(app, requiresAuth);

// app.use(require('./public/routes/auth'));

require("./routes/user")(app, requiresAuth,__dirname);

app.use(express.static(__dirname + '/images'));

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({
    'errors': {
      message: err.message,
      error: err
    }
  });
});

var server = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port);
});


