const login = require("./models/login");
const create = require("./models/create");

module.exports = (app) => {
	app.use("/", login);
	app.use("/", create);

	app.get("/", (req, res) => {
	    res.render("t.ejs");
	})
}