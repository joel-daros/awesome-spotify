require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const app = express();
const port = 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URI = process.env.CALLBACK_URI;

const stateKey = 'spotify_auth_state';

// 1. Solicitiar o token de autorização
app.get('/login', (req, res) => {
  const state = 'z5ZZA7zD7m213edw';
  res.cookie(stateKey, state);

  const scope = ['user-read-private', 'user-read-email', 'user-top-read'].join(' ');

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: CALLBACK_URI,
    state,
    scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// 2. com o token de autorização requisitar o acess token e refresh token
// https://developer.spotify.com/documentation/general/guides/authorization-guide/
app.get('/callback', async (req, res) => {
  // buscando o codigo de autorização retornado pelo redirect
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK_URI,
      }),
      headers: {
        'conten-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
          'base64'
        )}`,
      },
    });

    // se o retorno foi bem sucedido, fazer um nova chamada para buscar os dados do usuario
    if (response.status === 200) {
      const { access_token, refresh_token, expires_in } = response.data;

      const queryParams = querystring.stringify({
        access_token,
        refresh_token,
        expires_in,
      });

      res.redirect(`http://localhost:3000?${queryParams}`);

      // const user = await axios.get('https://api.spotify.com/v1/me', {
      //   headers: {
      //     Authorization: `${token_type} ${access_token}`,
      //   },
      // });
      // res.send(user.data);
    } else {
      res.redirect(`/?${querystring.queryParams({ error: 'invalid token' })}`);
    }
  } catch (error) {
    res.send(error);
  }
});

app.get('/refresh_token', async (req, res) => {
  const { refresh_token } = req.query;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      headers: {
        'conten-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
          'base64'
        )}`,
      },
    });

    if (response.status === 200) {
      res.send(response.data);
    }
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`App listend at port: ${port}`);
});
