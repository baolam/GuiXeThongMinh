const express = require("express");
const router = express.Router();
const ControlLogin = require("../controller/control-login");

router.post("/login", ControlLogin.LOGIN);
router.post("/qr", ControlLogin.GET_STRING_WILL_GENERATE_QR);
router.get("/login", (req, res) => res.send("Hello"));

module.exports = router;