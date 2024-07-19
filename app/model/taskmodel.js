const { default: mongoose } = require("mongoose")

const newScema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    userid: { type: mongoose.Schema.Types.ObjectId },
    completed: { type: Boolean, default: false },
})


module.exports = mongoose.model('task', newScema)