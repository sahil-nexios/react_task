const jwt = require('jsonwebtoken');
const userModel = require("../model/usermodel");
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
        new userModel({ ...req.body, password: bpass }).save()
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



module.exports = {
    signup,
    login
}