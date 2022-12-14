const { getUserByEmailModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function isNewUser(req, res, next) {
    const user = await getUserByEmailModel(req.body.email);
    if (user) {
        res.status(400).send("User Already Exists");
        return;
    }
    next();
}

function isEmailValid(req, res, next) {
    {
        if (
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)
        ) {
            next();
            return;
        }
        res.status(400).send("You have entered an invalid email address!");
        return;
    }
}

function passwordsValidation(req, res, next) {
    if (req.body.password !== req.body.rePassword) {
        res.status(400).send("Passwords don't match");
        return;
    }
    let passw = /^(?=.*\d).{4,8}$/;
    if (!req.body.password.match(passw)) {
        res.status(400).send(
            "Password expression. Password must be between 4 and 8 digits long and include at least one numeric digit. examples: 1234 | asdf1234 | asp123"
        );
        return;
    }
    next();
}

function hashPwd(req, res, next) {
    const saltRounds = 10;
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
            res.status(500).send(err.message);
            return;
        }
        req.body.password = hash;
        next();
    });
}

async function isExistingUser(req, res, next) {
    const user = await getUserByEmailModel(req.body.email, req.body.password);
    if (user) {
        req.body.user = user;
        next();
        return;
    }
    res.status(400).send("User with this email does not exist");
    return;
}

async function verifyPwd(req, res, next) {
    const { user } = req.body;

    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        }
        if (result) {
            next();
            return;
        } else {
            console.log(err);
            res.status(400).send("Incorrect Password!");
        }
    });
}

async function verifyToken(req, res, next) {
    console.log(req.headers.authorization, "req.headers.authorization");
    if (!req.headers.authorization) {
        res.status(401).send("Authorization headers required");
        return;
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log(err);
            res.status(401).send("Unauthorized");
            return;
        }
        if (decoded) {
            console.log(decoded);
            req.body.email = decoded.email;
            next();
            return;
        }
    });
}

module.exports = {
    // auth,
    isNewUser,
    isEmailValid,
    passwordsValidation,
    hashPwd,
    isExistingUser,
    verifyPwd,
    verifyToken,
};
