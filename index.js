require('es6-promise').polyfill();
var fetch = require('isomorphic-fetch');
var queryString = require('query-string');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();

app.set('port', (process.env.PORT || 5000));

var session = require('express-session');

var FileStore = require('session-file-store')(session);

var oauth_host = 'https://modao.cc';
var host = 'https://modao-oauth-api-demo.herokuapp.com';

app.use(session({
  name: '_modao_api_demo',
  secret: process.env.APP_SECRET,
  saveUninitialized: true,
  resave: true,
  store: new FileStore(),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));


app.engine('handlebars', exphbs({defaultLayout: 'default'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index', {
    user_name: req.session['user_name'],
    avatar: req.session['avatar']
  });
});

app.get('/login', function (req, res) {
  var params = {
    client_id: process.env.CLIENT_ID,
    redirect_uri: host + '/auth/Mockingbot/callback',
    state: 'abcd1234',
    response_type: 'code'
  };
  res.redirect(oauth_host + '/oauth2/v1/authorize?' + queryString.stringify(params));
});

app.get('/logout', function (req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });
});

app.get('/auth/Mockingbot/callback', function (req, res) {
  var code = req.query.code;
  var payload = {
    redirect_uri: host + '/auth/Mockingbot/callback',
    client_id: process.env.CLIENT_ID,
    code: code,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code'
  };

  fetch(oauth_host + '/oauth2/v1/token', {
    method: 'post',
    body: queryString.stringify(payload)
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    return Promise.resolve(data.access_token);
  })
  .then(function (access_token) {
    return fetch(oauth_host + '/api/v1/user_info', {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    })
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (user_info) {
    req.session['user_name'] = user_info.name;
    req.session['avatar'] = user_info.avatar;
    res.redirect('/');
  })
  .catch(function (error) {
    console.log('Request failed', error);
  });
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
