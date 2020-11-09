const express = require("express");
const router = express.Router();
const Create = require("../controller/create-user");

router.post("/create", Create.CREATE);
router.get("/test", Create.TEST);

module.exports = router;