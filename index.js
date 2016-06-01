require('es6-promise').polyfill();
var fetch = require('isomorphic-fetch');
var queryString = require('query-string');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();

app.set('port', (process.env.PORT || 5000));

var redisClient = require('redis').createClient(process.env.REDIS_URL);

var session = require('express-session');

var RedisStore = require('connect-redis')(session);

var oauth_host = 'https://modao.cc';
var host = 'https://modao-oauth-api-demo.herokuapp.com';

app.use(session({
  name: '_modao_api_demo',
  secret: process.env.APP_SECRET,
  store: new RedisStore({ client: redisClient })
}));

app.engine('handlebars', exphbs({defaultLayout: 'default'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', function (req, res) {
  if(req.session['token']) {
    fetch(oauth_host + '/api/v1/user_info', {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + req.session['token']
      }
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (user_info) {
      res.render('index', {
        user_name: user_info.name,
        avatar: user_info.avatar
      });
    })
    .catch(function (error) {
      console.error('Request failed', error);
    });
  } else {
    res.render('index');
  }

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
    var token = data.access_token
    req.session['token'] = token;
    res.redirect('/');
  })
  .catch(function (error) {
    console.error('Request failed', error);
  });
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
