const config = require("./utils/config");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const mongoose = require("mongoose");

console.log("Connecting to", config.MONGODB_URI);

mongoose
	.connect(config.MONGODB_URI, { useNewUrlParser: true })
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch(error => {
		console.log("Error connection to MongoDB:", error.message);
	});

app.use(cors());
app.use(bodyParser.json());

app.use("/api/blogs", blogsRouter);

module.exports = app;
