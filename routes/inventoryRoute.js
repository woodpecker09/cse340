// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index")
const invController = require("../controllers/invController")
const invValidate = require('../utilities/inv-validation')

//Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagementView));

router.get("/classification", utilities.handleErrors(invController.builClassificationView));

router.get("/inventory", utilities.handleErrors(invController.buildInventoryView));

router.post(
  "/classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.processClassification)
)

router.post(
  "/inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.processInventory)
)
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view
router.get("/detail/:invId", invController.buildDetailView);

router.get("/error-trigger", invController.triggerError);

module.exports = router;