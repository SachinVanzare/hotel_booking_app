const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, isAdmin } = require("../middleware/auth");
const { celebrate, Joi } = require("celebrate");


// Define auth routes
router.post('/signup', celebrate({
    body: Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    })
}), authController.signup);
router.post('/login', authController.login);
router.post('/logout',authenticate, authController.logout);
router.delete('/users/:id', authenticate, isAdmin, authController.deleteUser);

module.exports = router;