const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/type", utilities.handleErrors(accountController.buildType))

router.get("/type-access", utilities.handleErrors(accountController.buildAccessType))

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

router.post(
  "/master-key",
  regValidate.masterKeyRules(),
  regValidate.checkKeyData,
  utilities.handleErrors(accountController.prossessMasterKey)
)
module.exports = router

