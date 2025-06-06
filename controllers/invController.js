const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ****************************************
*  Deliver Vehicle Management view
* *************************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management",{
    title: "Vehicle Management",
    nav,
    errors: null
  })
}

invCont.builClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Vehicle Classification",
    nav,
    errors: null
})
}


invCont.buildInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classifications = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Vehicle Inventory",
    nav,
    classification: classifications || "error loading classifications",
    errors: null
  })
}


/* ****************************************
*  Process Inventory Classification
* *************************************** */


invCont.processClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const regClassification = await invModel.addClassification(classification_name)
  if (regClassification) {
    req.flash(
      "notice",
      `Congratulations, you have added a classification.`
    )
    res.status(201).render("inventory/add-classification", {
      title: "Vehicle Classification",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the add classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Vehicle Classification",
      nav,
      errors: null,
    })
  }
}


invCont.processInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  const regInventory = await invModel.addInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
  let classifications = await utilities.buildClassificationList()
  if (regInventory) {
    req.flash(
      "notice",
      `Congratulations, you have added a new item.`
    )
    res.status(201).render("inventory/add-inventory", {
      title: "Vehicle Classification",
      nav,
      errors: null,
      classification: classifications || "error loading classifications",
    })
  } else {
    req.flash("notice", "Sorry, the add inventory failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Vehicle Classification",
      nav,
      errors: null,
      classification: classifications || "error loading classifications",
    })
  }
}  

























/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryById(invId)
  const detail = await utilities.buildDetailView(data)
  let nav = await utilities.getNav()
  const className = data[0].inv_make + " " + data[0].inv_model
  res.render("inventory/detail", {
    title: className,
    nav,
    detail,
  })
}
// error trigger ------
invCont.triggerError = (req, res, next) => {
  try {
    const error = new Error();
    error.status = 500;
    throw error;
  } catch (error) {
    next(error);
  }
};

module.exports = invCont