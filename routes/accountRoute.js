const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
router.get("/login",utilities.handleErrors(accountController.buildLogin))

router.get("/register",utilities.handleErrors(accountController.buildRegister))

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

router.get("/logout", utilities.handleErrors(accountController.accountLogout))

router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdate))

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checklogData,
  utilities.handleErrors(accountController.accountLogin)
)

router.post(
  "/update-info",
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password",
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
)
module.exports = router

