let axios = require("axios");
let qs = require("qs");

let {
  COGNITO_CLIENT_ID,
  COGNITO_DOMAIN_NAME_URL,
  COGNITO_LOGIN_GRANT_TYPE,
  COGNITO_LOGIN_REDIRECT_URL,
  COGNITO_LOGIN_RESPONSE_TYPE,
  COGNITO_LOGIN_SCOPE,
  COGNITO_LOGOUT_REDIRECT_URL,
} = process.env;

let getUserInfo = async ({ accessToken }) => {
  let url = `${COGNITO_DOMAIN_NAME_URL}/oauth2/userInfo`;
  let { data } = await axios({
    url,
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // "data" looks like:
  // {
  //   sub: '6010f967-5ed...',
  //   email_verified: 'true',
  //   email: 'example@example.com',
  //   username: '6010f967-5ed...'
  // }
  console.log("/oauth2/userInfo", data);
  return data;
};

let postToken = async ({ code }) => {
  console.log("code", code);
  let url = `${COGNITO_DOMAIN_NAME_URL}/oauth2/token`;
  let params = {
    grant_type: COGNITO_LOGIN_GRANT_TYPE,
    client_id: COGNITO_CLIENT_ID,
    redirect_uri: COGNITO_LOGIN_REDIRECT_URL,
    code,
  };
  let { data } = await axios({
    url,
    method: "post",
    data: qs.stringify(params),
  });

  // "data" looks like:
  // {
  //   id_token: "eyJra...",
  //   access_token: "eyJra...",
  //   refresh_token: "eyJjd...",
  //   expires_in: 3600,
  //   token_type: "Bearer",
  // };
  console.log("/oauth2/token", data);
  return data;
};

let getLogin = async () => {
  let url = `${COGNITO_DOMAIN_NAME_URL}/login?client_id=${COGNITO_CLIENT_ID}&response_type=${COGNITO_LOGIN_RESPONSE_TYPE}&scope=${COGNITO_LOGIN_SCOPE}&redirect_uri=${COGNITO_LOGIN_REDIRECT_URL}`;
  return url;
};

let getLogout = async () => {
  let url = `${COGNITO_DOMAIN_NAME_URL}/logout?client_id=${COGNITO_CLIENT_ID}&logout_uri=${COGNITO_LOGOUT_REDIRECT_URL}`;
  return url;
};

module.exports = { getUserInfo, postToken, getLogin, getLogout };
