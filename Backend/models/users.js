const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    imageUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationMethod: { type: String, enum: ['email', 'phone'] },
    otp: { type: String },
    otpExpiresAt: { type: Date }
}, { timestamps: true });

const User = mongoose.model("users", UserSchema);
module.exports = User;