var User = require("../Model/UserModel")
var bcrypt = require("bcrypt")
var jwt = require("jsonwebtoken")

// REGISTER
var registerUser = async (req, res) => {
  try {
    var { name, email, password } = req.body

    var userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(409).json({   // ❗ important
        message: "user exists"
      })
    }

    var hashPassword = await bcrypt.hash(password, 10)

    var newUser = await User.create({
      name,
      email,
      password: hashPassword
    })

    res.status(201).json({
      message: "account created",
      user: newUser
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
}


// LOGIN
var login = async (req, res) => {
  try {
    var { email, password } = req.body

    var userExists = await User.findOne({ email })

    if (!userExists) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    var checkPassword = await bcrypt.compare(password, userExists.password)

    if (!checkPassword) {
      return res.status(401).json({
        message: "Incorrect password"
      })
    }

    var token = jwt.sign(
      {
        userId: userExists._id,
        email: userExists.email,
        role: userExists.role
      },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" }
    )

    res.status(200).json({
      message: "login done",
      webToken: token
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
}

module.exports = {
  registerUser,
  login
}