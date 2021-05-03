/*
 * app.js
 * SurveyCity
 * 2020-11-09
 */

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressSession = require("express-session");
const passport = require("passport");
const flash = require("express-flash");
const MongoStore = require("connect-mongo")(expressSession);

const database = require("./database");
const User = require("./models/user");

const mainRouter = require("./routes/_main");

// return a factory function
module.exports = async (mongooseUri) => {
  await database.connect(mongooseUri);

  // http app setup
  const app = express();

  // passport setup
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

  // other middleware setup
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    expressSession({
      secret: process.env.SESSION_SECRET || "It's a plane in the sky!",
      saveUninitialized: false,
      resave: true,
      store: new MongoStore({
        mongooseConnection: database.connection,
        ttl: 7 * 24 * 60 * 60,
        touchAfter: 24 * 60 * 60,
      }),
    })
  );
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.static(path.join(__dirname, "node_modules")));

  app.use("/", mainRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error", { title: "Something went wrong! • SurveyCity" });
  });

  return app;
};
