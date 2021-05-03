/*
 * register.js
 * SurveyCity
 * 2020-11-29
 */

const express = require("express");
const router = express.Router();

const passport = require("passport");
const User = require("../models/user")

router.get("/", (req, res) => {
    if (req.user)
        return res.redirect("/");

    res.render("auth/register", {
        title: "Register",
        messages: req.flash("registerMessage"),
    });
});

router.post("/", (req, res) => {
    // instantiate a user object
    let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        fullName: req.body.displayName,
    });

    User.register(newUser, req.body.password, err => {
        if (err) {
            if (err.name === "UserExistsError")
                req.flash("registerMessage", "Registration error: User already exists.");

            return res.render("auth/register", {
                title: "Register",
                messages: req.flash("registerMessage"),
            });
        }

        passport.authenticate("local")(req, res, () => {
            res.redirect("/survey");
        });
    });
});


module.exports = router;