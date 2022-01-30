const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {type: String, trim: true, required: true},
    email: {type: String, trim: true, required: true, unique: true},
    encryptedPassword: {type: String, trim: true, required: true},
    role: {type: String, enum: ['customer', 'service', 'admin'], required: true}
})

const User = mongoose.model('User', userSchema);
module.exports = User;