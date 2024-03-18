const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const User = require("../model/User.js");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require('bcrypt')

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.signup = async (req, res) => {
  const { email,password,username } = req.body.data;
  console.log(email,password,username)
  // Check we have an email
  if (!email) {
    return res.status(422).json({ message: "Missing email." });
  }
  try {
    // Check if the email is in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already in use.",
      });
    }
    console.log("hello")

    // Step 1 - Create and save the user

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // const che = await bcrypt.compare(password,hashedPass)
    // console.log(che,"hello")

    const user = await new User({
      _id: new mongoose.Types.ObjectId(),
      username:username,
      email: email,
      password:hashedPass
    }).save();

    console.log(user)

    // Step 2 - Generate a verification token with the user's ID
    const verificationToken = user.generateVerificationToken();

    // Step 3 - Email the user a unique verification link
    const url = `http://localhost:5173/verify/${verificationToken}`;
    transporter.sendMail(
      {
        from: "priyanshu.yadav@ksolves.com",
        to: email,
        subject: "Verify Account",
        html: `Click <a href = '${url}'>here</a> to confirm your email.`,
      },
      (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log("msg sent");
        }
      }
    );
    return res.status(201).json({user,
      message: `Sent a verification email to ${email}`,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json(err);
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
        message: "User does not exists",
      });
    }
    // console.log(password,user.password)

    // step 2 - Ensure Password is correct or not
    const validate = await bcrypt.compare(password,user.password)
    if (!validate) {
      res.status(400).json({message : "wrong credentials!"});
      return;
    }

    // Step 3 - Ensure the account has been verified
    if (!user.verified) {
      return res.status(403).json({
        message: "Verify your Account.",
      });
    }

    const verificationToken = jwt.sign(
      { ID: user._id },
      process.env.USER_VERIFICATION_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // const payload = jwt.verify(verificationToken, process.env.USER_VERIFICATION_TOKEN_SECRET);
    // console.log(payload)

    return res.status(200).json({
      message: "User logged in",
      verificationToken,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.verify = async (req, res) => {
  const { token } = req.params;
  // console.log(req.params)
  // Check we have an id
  if (!token) {
    return res.status(422).json({
      message: "Missing Token",
    });
  }
  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET);
    // console.log(payload)
  } catch (err) {
    console.log("hello");
    return res.status(500).json({message:"Token Not Valid"});
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
      return res.status(200).json({
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
    return res.status(500).json(err);
  }
};

exports.forgotPassword = async (req, res) => {
  // find the user, if present in the database
  const user = await User.findOne({ 
    email: req.body.data.email });

  if (!user) {
    return res.status(400).json({message : "This Email Not Exist, Enter Correct Email"});
  }
//   console.log("hello" + user);

  // Generate the reset token
  const resetToken = user.createPasswordResetToken();
  await user.save();
//   console.log(user);
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  try {
    const message = `Forgot your password? Click link: <a href = '${resetUrl}'>Here</a>\n If you did not request this, please ignore this email and your password will remain unchanged.`;

    transporter.sendMail(
      {
        from: "priyanshu.yadav@ksolves.com",
        to: req.body.data.email,
        subject: "Verify Account",
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

    // Finds user based on the token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // console.log("hello"+user)

    if (!user) {
      return res.status(400).send("Token is invalid or has expired");
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // console.log(user)
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.log(error)
    res.send(error);
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
