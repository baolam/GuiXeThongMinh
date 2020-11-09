const lowdb = require("lowdb");
const adapter = require("lowdb/adapters/FileSync");

const users = new adapter("./server-handler/server/database/testing.json");
const testing = lowdb(users);

testing.defaults({data : []}).write();
let user =
	{
		name : "lamdethuong",
		pass : ".......",
		id : "noid",
	}

// testing.get("data")
// 	   .push(user)
// 	   .write()

function deleteUser(user) {
	testing.get("data")
		.remove({name : user})
		.write()

	console.log("Delete complete");
}

module.exports  = {
	deleteUser : deleteUser
}