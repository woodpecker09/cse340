const utilities = require("./index")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
*  Classification Data Validation Rules
* ********************************* */
validate.classificationRules = () => {
  return [
    // firstname is required and must be string
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Please provide a classification name.")
  ]
}

/*  **********************************
*  Data Validation Rules
* ********************************* */

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a classification."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Please provide a make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Please provide a model."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .custom((value) => {
        return /^(https?:\/\/|\/images\/)/.test(value)
      })
      .withMessage("Please provide a valid img URL or relative path (starting with /images/)."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .custom((value) => {
        return /^(https?:\/\/|\/images\/)/.test(value)
      })
      .withMessage("Please provide a valid thumbnail URL or relative path (starting with /images/)."),
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isInt({ min: 0 })
      .withMessage("Please provide a valid price."),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("Please provide a valid year."),
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a valid mileage."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Please provide a color."),
    ]
}

/*  **********************************
*  Data Validation Rules
* ********************************* */

validate.newInventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a classification."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Please provide a make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Please provide a model."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .custom((value) => {
        return /^(https?:\/\/|\/images\/)/.test(value)
      })
      .withMessage("Please provide a valid img URL or relative path (starting with /images/)."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .custom((value) => {
        return /^(https?:\/\/|\/images\/)/.test(value)
      })
      .withMessage("Please provide a valid thumbnail URL or relative path (starting with /images/)."),
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isInt({ min: 0 })
      .withMessage("Please provide a valid price."),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("Please provide a valid year."),
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a valid mileage."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Please provide a color."),
    body("inv_id")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .isNumeric()
      .withMessage("Invalid inventory ID.")
    ]
}




/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  const {classification_name} = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Vehicle Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

// checkInvData
validate.checkInvData = async (req, res, next) => {
  const {classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color} = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let classifications = await utilities.buildClassificationList(classification_id)
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      errors,
      title: "Vehicle Inventory",
      nav,
      classification: classifications || "error loading classifications",
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
        
    })
    return
  }
  next()
}

//  errors will be directed back to the edit view
validate.checkUpdateData = async (req, res, next) => {
  const {classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id} = req.body
  let errors = []
  errors = validationResult(req)
  console.log("errors: ", errors)
  if (!errors.isEmpty()) {
    let classifications = await utilities.buildClassificationList(classification_id)
    let nav = await utilities.getNav()
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect: classifications || "error loading classifications",
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id  
    })
    return
  }
  next()
}


module.exports = validate