const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const User = require("../model/User.js");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require('bcrypt')

const transporter = nodemailer.createTransport({
  host:process.env.SMTP_HOST,
  port:process.env.SMTP_PORT,
  secure:true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.signup = async (req, res) => {
  const { email,password,username } = req.body.data;
  // Check we have an email
  if (!email || !password || !username) {
    return res.status(422).json({ message: "Missing input field's value." });
  }
  try {
    // Check if the email is in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already in use.",
      });
    }

    // Step 1 - Create and save the user

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const user = await new User({
      _id: new mongoose.Types.ObjectId(),
      username:username,
      email: email,
      password:hashedPass
    }).save();

    // Step 2 - Generate a verification token with the user's ID
    const verificationToken = user.generateVerificationToken();
    // console.log(verificationToken)

    // Step 3 - Email the user a unique verification link
    const url = `http://localhost:5173/verify/${verificationToken}`;
    transporter.sendMail(
      {
        from: "KsolvesTagManager@gmail.com",
        to: email,
        subject: "KTM Verify Account",
        html: `Click <a href = '${url}'>${url}</a> to confirm your email.`,
      },
      (err, res) => {
        if (err) {
          console.log(err);
          // return res.json({message:"Service unavailable"})
        } else {
          console.log("msg sent");
        }
      }
    );
    return res.status(201).json({user,
      message: `Sent a verification email to ${email}`,
    });
  } catch (err) {
    // console.log(err)
    return res.status(503).json({message : "Service unavailable"});
  }
};

exports.login = async (req, res) => {
  const { email,password } = req.body.data;
  // console.log(email,password)
  // Check we have an email
  if (!email) {
    return res.status(422).json({
      message: "Missing email.",
    });
  }
  try {
    // Step 1 - Verify a user with the email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email does not exists",
      });
    }

    // step 2 - Ensure Password is correct or not
    const validate = await bcrypt.compare(password,user.password)
    if (!validate) {
      res.status(400).json({message : "wrong credentials!"});
      return;
    }

    // Step 3 - Ensure the account has been verified
    if (!user.verified) {
      return res.status(403).json({
        message: "First Verify your Account.",
      });
    }

    const verificationToken = jwt.sign(
      { ID: user._id },
      process.env.USER_VERIFICATION_TOKEN_SECRET,
      { expiresIn: "7d" }
    );


    return res.status(200).json({
      message: "User logged in",
      verificationToken,
    });
  } catch (err) {
    return res.status(503).json({message:"Service unavailable"});
  }
};

exports.verify = async (req, res) => {
  const { token } = req.params;

  // Check we have an id
  if (!token) {
    return res.status(422).json({message: "Missing Token",});
  }

  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).json({message:"Token Not Valid"});
  }
  try {
    // Step 2 - Find user with matching ID
    const user = await User.findOne({ _id: payload.ID });
    if (!user) {
      return res.status(404).json({
        message: "User does not exists",
      });
    }
    if (user.verified) {
      return res.status(409).json({
        message: "Account Already Varified",
      });
    }
    // Step 3 - Update user verification status to true
    user.verified = true;
    await user.save();
    return res.status(200).json({
      message: "Account Verified",
    });
  } catch (err) {
    return res.status(503).json({message : "Service Unavailable"});
  }
};

exports.forgotPassword = async (req, res) => {
  // find the user, if present in the database
  const user = await User.findOne({ 
    email: req.body.data.email });

  if (!user) {
    return res.status(401).json({message : "This Email Not Exist, Enter Correct Email"});
  }

  // Generate the reset token
  const resetToken = user.createPasswordResetToken();
  // console.log("hello")
  const OTP = user.generateOTP()
  // console.log(OTP)
  await user.save();

  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  try {
    const message = `Forgot your password?\n Please enter OTP to reset password :
    <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${OTP}</h1>
    \n  Click link: <a href = '${resetUrl}'>${resetUrl}</a> to got Reset Password page.\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    transporter.sendMail(
      {
        from: "KsolvesTagManager@gmail.com",
        to: req.body.data.email,
        subject: "KTM Reset Forgot Password ",
        html: message,
      },
      (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log("msg sent");
        }
      }
    );

    res.status(200).json({
      status: "success",
      message: "messsage sent to mail",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.log("error");
    res.send(error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const {otp} = req.body.data

    // Finds user based on the token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      otp:otp,
      otpExpires : {$gt:Date.now()}
    });
    // console.log("hello"+user)
    if (!user) {
      return res.status(410).json({message : "Token/OTP is invalid or has expired"});
    }

    // Check if Last password is same as Current One
    const validate = await bcrypt.compare(req.body.data.password,user.password)
    if(validate){
      return res.status(400).json({message:"This Password is same as last password"})
    }

    //Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.data.password, salt);

    user.password = hashedPass;

    //Remove passwordResetToken 
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.otp = undefined
    user.otpExpires = undefined
    await user.save();
    res.status(205).json({
      status: "success",user
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.delete = async (req,res) =>{
  try {
    const {id} = req.params
    const data = await User.findByIdAndDelete(id)
    console.log(data)
    res.status(200).json("deleted")
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
