const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { authUser } = require("../../middleware/auth")

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/All_user", userController.All_user);



module.exports = router;
