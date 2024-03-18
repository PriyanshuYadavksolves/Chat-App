const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')

const jwt = require('jsonwebtoken');
const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username:String,
    email: String,
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
      },
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      otp:String,
      otpExpires:Date,
});
// UserSchema.pre('save', async function (next) {
//     // Hash the user password
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   });

UserSchema.methods.generateVerificationToken = function () {
    const user = this;
    const verificationToken = jwt.sign(
        { ID: user._id },
        process.env.USER_VERIFICATION_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    return verificationToken;
};

UserSchema.methods.createPasswordResetToken = function () {
    // generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // encrypt the token
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // sets the time the reset password token expire (10 mins)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
  };

  UserSchema.methods.generateOTP = function () {
    const otp = otpGenerator.generate(6,{
        upperCaseAlphabets: true,
        specialChars: false,
      })
    this.otp = otp
    this.otpExpires = Date.now()+10*60*1000

    return otp
  }

 

module.exports = mongoose.model("User", UserSchema);