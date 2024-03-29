const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getAllUsersModel, editUserModel, signUpModel, getUserByEmailModel, findUserById, deleteUserModel } = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const newUser = require("../models/userModelMongoose");

async function signUp(req, res, next) {
    try {
        const { email, password, firstName, lastName, phone, isAdmin } = req.body;
        const createUser = new newUser({
            email,
            password,
            firstName,
            lastName,
            phone,
            isAdmin,
            date: Date.now(),
        });

        const user = await createUser.save();
        if (user) {
            res.send(user);
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err?.message || "Error creating user");
        next(err);
    }
}

async function getCurrentUser(req, res, next) {
    try {
        const { userId } = req.body;
        const currentUser = await findUserById(userId);
        if (currentUser) {
            res.send(currentUser);
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err?.message || "Error getting user");
        next(err);
    }
}

async function getAllUsers(req, res) {
    try {
        const allUsers = await getAllUsersModel();
        res.send(allUsers);
        return allUsers;
    } catch (err) {
        console.log(err);
        res.status(500).send(err?.message || "Error getting users");
    }
}

function login(req, res) {
    try {
        const { user } = req.body;
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: "15m",
        });
        res.send({
            token: token,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            id: user._id,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err?.message || "Error login user");
    }
}

function logout(req, res) {
    try {
        if (req.headers.authorization) {
            res.clearCookie("token");
            res.send({ ok: true });
        } else {
            throw new Error("No cookie to clear");
        }
    } catch (err) {
        res.status(500).send(err?.message || "error clearing user");
    }
}

async function editUser(req, res) {
    try {
        const { userId } = req.params;
        console.log(req.body);
        const user = await editUserModel(userId, req.body);
        res.send(user);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.massage);
    }
}

module.exports = {
    signUp,
    login,
    getAllUsers,
    logout,
    editUser,
    getCurrentUser,
};
