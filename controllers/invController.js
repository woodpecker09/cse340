const { raw } = require("body-parser")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ****************************************
*  Deliver Vehicle Management view
* *************************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management",{
    title: "Vehicle Management",
    nav,
    errors: null,
    classification: classificationSelect || "error loading classifications"
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

// insert a new inventory item

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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const rawdata = await invModel.getInventoryById(inv_id)
  const itemData = rawdata[0]
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build Delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const rawdata = await invModel.getInventoryById(inv_id)
  const itemData = rawdata[0]
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delelte " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_id,
          inv_make,
          inv_model,
          inv_price,
          inv_year, } = req.body;
  const parsedInvId = parseInt(inv_id);
  const deleteResult = await invModel.deleteInventoryItem( parsedInvId )

  if (deleteResult) {
    req.flash("notice", `The Delete was successfull.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Edit " + itemName,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price
    })
  }
}

module.exports = invCont