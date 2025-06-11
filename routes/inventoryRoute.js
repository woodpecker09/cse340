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

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inventory_id", utilities.handleErrors(invController.editInventoryView))

router.get("/delete/:inventory_id", utilities.handleErrors(invController.deleteInventoryView))


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

router.post("/update/",
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.post("/delete/",
  utilities.handleErrors(invController.deleteInventory)
)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view
router.get("/detail/:invId", invController.buildDetailView);

router.get("/error-trigger", invController.triggerError);

module.exports = router;