const utilities = require("./index")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
      
      body("account_type")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Type of Account Not Defined")
      .custom(async (accountType) => {
        if (accountType !== 'Client' && accountType !== 'Employee' && accountType !== 'Admin'){
          throw new Error("Type of Account Not Defined")
        }
      })
  ]
}

validate.loginRules = () => {
  return [
      // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
* Update Data Validation Rules
 * ***************************** */
validate.updateRules = () => {
  return [
    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .isNumeric()
      .withMessage("Invalid account ID."),
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), 

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), 

    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (account_email, { req }) => {
      const account_id = parseInt(req.body.account_id)
      const sameEmail = await accountModel.getEmailById(account_id)
      const emailExists = await accountModel.checkExistingEmail(account_email)     
      if (emailExists && sameEmail.account_email !== account_email) {
        throw new Error("Email exists. Please log in or use a different email.")
      }
    })
  ]
}

validate.updatePasswordRules = () => {
  return [
    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .isNumeric()
      .withMessage("Invalid account ID."),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

validate.masterKeyRules = () => {
  return [
    body("master_key")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Master Key does not meet requirements.")
      .custom(async (master_key, { req }) => {
        const accountType = req.body.account_type
        const masterKeyData = await accountModel.getMasterKeyByType(accountType)
        const checkMasterKey = await bcrypt.compare(master_key, masterKeyData.master_key_hash)     
        if (!checkMasterKey) {
          throw new Error("Key is not correct.")
        }
      })
  ]
}
  

validate.checkUpdatePasswordData = async (req, res, next) => {
  const {account_id} = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const accountData = await accountModel.getEmailById(account_id)
    res.render("account/update-view", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    })
    return
  }
  next()
}
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_type } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_type
    })
    return
  }
  next()
}

validate.checklogData = async (req, res, next) => {
  const {account_email} = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

validate.checkUpdateData = async (req, res, next) => {
  const {account_id, account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-view", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
    return
  }
  next()
}

validate.checkKeyData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/assign-type", {
      errors,
      title: "Assign Account Type",
      nav
    })
    return
  }
  next()
}


module.exports = validate