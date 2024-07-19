const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { authUser } = require("../../middleware/auth")

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/all_user", userController.All_user);

router.post("/add_task", authUser, userController.Add_task)
router.get("/all_task", authUser, userController.All_task)
router.get("/view_single_task/:id", authUser, userController.view_single_task)
router.post("/task_status/:id", authUser, userController.task_status)
router.post("/update_task/:id", authUser, userController.update_task)
router.get("/delete_task/:id", authUser, userController.delete_task)



module.exports = router;
