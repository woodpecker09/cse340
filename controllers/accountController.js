const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

/* ****************************************
*  Deliver access type view
* *************************************** */
async function buildType(req, res) {
  let nav = await utilities.getNav()
  res.render("account/select-type", {
    title: "Account Type",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver access type Assign in view
* *************************************** */
async function buildAccessType(req, res) {
  let nav = await utilities.getNav()
  res.render("account/assign-type", {
    title: "Assign Account Type",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver Register view
* *************************************** */
async function buildRegister(req, res, next) {
  if(!res.locals.account_type){
    res.locals.account_type = 'Client'
  }
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password, account_type} = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword,
    account_type
  )

  if (regResult) {
    req.flash(
      "noticeCorrect",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  deliver the login request
 * ************************************ */
async function buildManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  if(res.locals.loggedin === 1){
    res.clearCookie("jwt")
    req.flash("noticeCorrect", "You have been logged out.")
    return res.redirect("../")
  } else{
    return res.redirect("../")
  }
  
}

/* ****************************************
 *  Deliver update view
 * *************************************** */
async function buildUpdate(req, res) {
  const {account_firstname, account_lastname, account_email} = res.locals.accountData
  let nav = await utilities.getNav()
  res.render("account/update-view", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname: account_firstname,
    account_lastname: account_lastname,
    account_email: account_email
  })
}

/* ****************************************
 *  Process update request
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email } = req.body
  const { account_id } = res.locals.accountData

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  ) 
  res.locals.accountData = updateResult.rows[0]
  if (updateResult) {
    req.flash("noticeCorrect", "Your account has been updated successfully.")
    res.status(200).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update-view", {
      title: "Edit Account",
      nav,
      errors: null,
    })
  }
}


/* ****************************************
 *  Process registration request Password is hashed before storing
 * *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const {account_id, account_password} = req.body
  const accountData = await accountModel.getEmailById(account_id)
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update.')
    res.status(500).render("account/update-view", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    })
  }

  const regResult = await accountModel.registerAccountPassword(
    account_id,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "noticeCorrect",
      "Congratulations! You have successfully changed your password."
    )
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update-view", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    })
  }
}


/* ****************************************
 *  Deliver account type view
 * *************************************** */
async function prossessMasterKey(req, res) {
  const {account_type} = req.body
  res.locals.account_type = account_type
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Registration",
    nav,
    errors: null
  })
}



module.exports = { buildLogin, buildRegister, registerAccount,  accountLogin, buildManagement, accountLogout, buildUpdate, updateAccount, updatePassword, buildType, buildAccessType, prossessMasterKey}; 