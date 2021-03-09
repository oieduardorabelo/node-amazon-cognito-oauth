require("dotenv").config();

let express = require("express");
let session = require("cookie-session");

let { uptime, env } = process;
let { PORT, HOSTNAME, COOKIE_SESSION_SECRET, COOKIE_SESSION_NAME } = env;

let { getUserInfo, postToken, getLogin, getLogout } = require("./cognito");

let app = express();

app.use(
  session({
    secret: COOKIE_SESSION_SECRET,
    name: COOKIE_SESSION_NAME,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect(`/users/${req.session.user.id}`);
  } else {
    getLogin()
      .then((url) => {
        res.status(200).send({ ok: true, uptime: uptime(), login: url });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ ok: false, error: err.message });
      });
  }
});

app.get("/oauth/cognito", (req, res) => {
  let { code } = req.query;

  postToken({ code })
    .then((tokens) => {
      getUserInfo({ accessToken: tokens.access_token })
        .then((userInfo) => {
          req.session.user = {
            accessToken: tokens.access_token,
            email: userInfo.email,
            emailVefired: userInfo.email_verified,
            id: userInfo.username,
          };
          res.redirect(302, `/users/${userInfo.username}`);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send({ ok: false, error: err.message });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ ok: false, error: err.message });
    });
});

app.get("/oauth/cognito/logout", (req, res) => {
  if (req.session.user) {
    req.session = {};
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

app.get("/users/:id", (req, res) => {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    let { id } = req.query;
    let { accessToken, email, emailVefired } = req.session.user;
    getLogout()
      .then((url) => {
        res.status(200).send({
          ok: true,
          id,
          accessToken,
          email,
          emailVefired,
          logout: url,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ ok: false, error: err.message });
      });
  }
});

app.listen(Number(PORT), HOSTNAME, () => {
  console.log(`Running at [${HOSTNAME}]:${PORT}`);
});
