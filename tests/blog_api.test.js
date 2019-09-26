const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const BlogPost = require("../models/blogPost");

const initialBlogs = [
	{
		title: "Introducing the New React DevTools",
		author: "Brian Vaughn",
		url: "https://reactjs.org/blog/2019/08/15/new-react-devtools.html",
		likes: "0"
	},
	{
		title: "React v16.8: The One With Hooks",
		author: "Dan Abramov",
		url: "https://reactjs.org/blog/2019/02/06/react-v16.8.0.html",
		likes: "23"
	},
	{
		title: "React v16.6.0: lazy, memo and contextType",
		author: "Sebastian Markbåge",
		url: "https://reactjs.org/blog/2018/10/23/react-v-16-6.html",
		likes: "16"
	}
];

beforeEach(async () => {
	await BlogPost.deleteMany({});

	let blogObject = new BlogPost(initialBlogs[0]);
	await blogObject.save();

	blogObject = new BlogPost(initialBlogs[1]);
	await blogObject.save();

	blogObject = new BlogPost(initialBlogs[2]);
	await blogObject.save();
});

test("Blogs are returned as json", async () => {
	await api
		.get("/api/blogs")
		.expect(200)
		.expect("Content-Type", /application\/json/);
});

test("Correct number of blogs returned", async () => {
	const response = await api.get("/api/blogs");
	expect(response.body.length).toBe(3);
});

test("ID field is named 'id'", async () => {
	const response = await api.get("/api/blogs");
	response.body.map(blog => {
		expect(blog.id).toBeDefined();
	});
});

test("New blog posts can be added", async () => {
	const newBlog = {
		title: "React v16.9.0 and the Roadmap Update",
		author: "Dan Abramov and Brian Vaughn",
		url: "https://reactjs.org/blog/2019/08/08/react-v16.9.0.html",
		likes: "0"
	};

	const initialResponse = await api.get("/api/blogs");
	const blogsCount = initialResponse.body.length;

	await api
		.post("/api/blogs")
		.send(newBlog)
		.expect(201)
		.expect("Content-Type", /application\/json/);

	const response = await api.get("/api/blogs");
	expect(response.body.length).toBe(blogsCount + 1);
});

test("Likes field is defined", async () => {
	const response = await api.get("/api/blogs");
	response.body.map(blog => {
		expect(blog.likes).toBeGreaterThanOrEqual(0);
	});
});

test("New blog posts without title or url fields get rejected", async () => {
	const newBlog = {
		author: "Dan Abramov and Brian Vaughn",
		likes: "0"
	};

	await api
		.post("/api/blogs")
		.send(newBlog)
		.expect(400);
});

test("Blog posts can be removed", async () => {
	const newBlog = {
		title: "React v16.9.0 and the Roadmap Update",
		author: "Dan Abramov and Brian Vaughn",
		url: "https://reactjs.org/blog/2019/08/08/react-v16.9.0.html",
		likes: "0"
	};

	await api
		.post("/api/blogs")
		.send(newBlog)
		.expect(201);

	const response = await api.get("/api/blogs");
	const blogId = response.body[response.body.length - 1].id;

	await api.delete(`/api/blogs/${blogId}`).expect(204);
});

afterAll(() => {
	mongoose.connection.close();
});
