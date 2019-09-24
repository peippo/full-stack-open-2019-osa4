const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

test("Blogs are returned as json", async () => {
	await api
		.get("/api/blogs")
		.expect(200)
		.expect("Content-Type", /application\/json/);
});

test("Correct number of blogs returned", async () => {
	const response = await api.get("/api/blogs");
	expect(response.body.length).toBe(2);
});

test("ID field is named 'id'", async () => {
	const response = await api.get("/api/blogs");
	response.body.map(blog => {
		expect(blog.id).toBeDefined();
	});
});

afterAll(() => {
	mongoose.connection.close();
});
