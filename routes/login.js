/*
 * login.js
 * SurveyCity
 * 2020-11-29
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", function (req, res) {
  if (req.user)
    return res.redirect("/");

  res.render("auth/login", {
    title: "Login",
    message: req.flash("loginMessage"),
  });
});

router.post(
  "/",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }),
  function (req, res) {
    res.redirect("/survey")
  }
);

module.exports = router;
