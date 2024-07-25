const jwt = require('jsonwebtoken');
const userModel = require("../model/usermodel");
const taskModel = require("../model/taskmodel");
const HTTP = require("../../constants/resCode");
const bcrypt = require('bcrypt');



const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        console.log("🚀 ~ signup ~  req.body:", req.body)
        if (!name || !email || !password) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "All Fields Are Required !" })
        if (!email.includes("@")) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Please Enter Valid Email !" })
        const finuser = await userModel.findOne({ email: email })
        if (finuser) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "This Email Is Already Taken !" })

        const bpass = await bcrypt.hash(password, 10)
        const newUser = new userModel({ ...req.body, password: bpass });
        await newUser.save();
        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "User Registered Successfully !" })

    } catch (error) {
        console.log("🚀 ~ signup ~ error:", error)
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "All Fields Are Required !" })
        const finuser = await userModel.findOne({ email: email })
        if (!finuser) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "User Not Found !" })
        const pass = await bcrypt.compare(password, finuser.password)
        if (pass) {
            const token = jwt.sign({ _id: finuser._id }, process.env.JWT_SECRET)
            return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Sign-in Successfully !", token })
        } else {
            return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Please Enter Valid Password !" })
        }
    } catch (error) {
        console.log("🚀 ~ login ~ error:", error)
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });
    }
}


const All_user = async (req, res) => {
    try {
        const findall = await userModel.find()
        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "All user !", findall })

    } catch (error) {
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });
    }
}

const Add_task = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "All Fields Are Required!" });
        }

        const lastTask = await taskModel.findOne({ userid: req.user._id }).sort({ position: -1 });
        const position = lastTask ? lastTask.position + 1 : 0;

        const newTask = new taskModel({ ...req.body, userid: req.user._id, position });
        await newTask.save();

        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Task Created Successfully!" });
    } catch (error) {
        console.error("🚀 ~ const Add_task = ~ error:", error);
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong!" });
    }
};


const All_task = async (req, res) => {
    try {
        const findall = await taskModel.find({ userid: req.user._id }).sort({ position: 1 });
        if (findall.length === 0) {
            return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "Tasks Not Found!" });
        }
        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "All Tasks !", tasks: findall });

    } catch (error) {
        console.error("🚀 ~ const All_task = ~ error:", error);
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong!" });
    }
};


const view_single_task = async (req, res) => {
    try {
        if (!req.params.id) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "params id not found !" })
        const findall = await taskModel.findOne({ _id: req.params.id })
        if (!findall) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "Task Not Found !" })
        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Task !", findall })

    } catch (error) {
        console.log("🚀 ~ constview_single_task= ~ error:", error)
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });
    }
}

const task_status = async (req, res) => {
    try {
        const { completed } = req.body
        const value = completed?.toString();

        if (value === "" || value === null || value === undefined) {
            return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "completed Fields Are Required !" })
        }
        const findall = await taskModel.findOne({ _id: req.params.id })
        if (!findall) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "Task Not Found !" });
        const updatetsk = await taskModel.findByIdAndUpdate(req.params.id, {
            $set: {
                completed: completed
            }
        })
        if (!updatetsk) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Status Not Updated !" })
        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Status Updated Succesfully !" })

    } catch (error) {
        console.log("🚀  consttask_status=  error:", error)
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });
    }
}
const update_task = async (req, res) => {
    try {
        const findall = await taskModel.findOne({ _id: req.params.id })
        if (!findall) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "Task Not Found !" });
        const updatetsk = await taskModel.findByIdAndUpdate(req.params.id, {
            $set: { ...req.body }
        })
        if (!updatetsk) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Task Not Updated !" })
        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Task Updated Succesfully !" })
    } catch (error) {
        console.log("🚀 ~ constupdate_task= ~ error:", error)
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });
    }
}

const delete_task = async (req, res) => {
    try {
        const findall = await taskModel.findOne({ _id: req.params.id })
        if (!findall) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "Task Not Found !" });
        const deletetsk = await taskModel.findByIdAndDelete(req.params.id)
        if (!deletetsk) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Task Not Deleted !" })

        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Task Deleted Succesfully !" })
    } catch (error) {
        console.log("🚀 ~ constdelete_task= ~ error:", error)
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });
    }
}


const tasks_reorder = async (req, res) => {
    try {
        const taskIds = req.body.taskIds;
        const Alltask = await taskModel.find({ userid: req.user._id });

        if (taskIds.length !== Alltask.length) return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Please Provide all Taskid !" });
        for (let i = 0; i < taskIds.length; i++) {
            if (taskIds[i] === "" || taskIds[i] === null || taskIds[i] === undefined) {
                return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Please Provide Valid Taskid !" });
            }
            await taskModel.findByIdAndUpdate(taskIds[i], { position: i });
        }
        return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Task Reorder Succesfully !" })
    } catch (error) {
        console.log("🚀 ~ consttasks_reorder= ~ error:", error)
        return res.status(HTTP.SUCCESS).send({ code: HTTP.INTERNAL_SERVER_ERROR, status: false, message: "Something Went Wrong !", });

    }
}




module.exports = {
    signup,
    login,
    All_user,
    Add_task,
    All_task,
    view_single_task,
    task_status,
    update_task,
    delete_task,
    tasks_reorder

}