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

beforeAll(async () => {
	await BlogPost.deleteMany({});

	let blogObject = new BlogPost(initialBlogs[0]);
	await blogObject.save();

	blogObject = new BlogPost(initialBlogs[1]);
	await blogObject.save();

	blogObject = new BlogPost(initialBlogs[2]);
	await blogObject.save();
});

describe("API returns", () => {
	test("blogs as json", async () => {
		await api
			.get("/api/blogs")
			.expect(200)
			.expect("Content-Type", /application\/json/);
	});

	test("correct number of blogs", async () => {
		const response = await api.get("/api/blogs");
		expect(response.body.length).toBe(3);
	});

	test("ID field as 'id'", async () => {
		const response = await api.get("/api/blogs");
		response.body.map(blog => {
			expect(blog.id).toBeDefined();
		});
	});

	test("blogs with Likes field defined", async () => {
		const response = await api.get("/api/blogs");
		response.body.map(blog => {
			expect(blog.likes).toBeGreaterThanOrEqual(0);
		});
	});
});

describe("API allows", () => {
	test("new blog posts to be added", async () => {
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

	test("blog posts to be removed", async () => {
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

	// FIXME: Returns 'null' on all fields?

	// test("Blog posts can be modified", async () => {
	// 	const newBlog = {
	// 		title: "React v16.9.0 and the Roadmap Update",
	// 		author: "Dan Abramov and Brian Vaughn",
	// 		url: "https://reactjs.org/blog/2019/08/08/react-v16.9.0.html",
	// 		likes: "0"
	// 	};

	// 	const updatedBlog = {
	// 		title: "React v17.0.0 and the Roadmap Update",
	// 		author: "Dan Abramov",
	// 		url: "https://reactjs.org/blog/2019/08/08/react-v17.0.0.html",
	// 		likes: "0"
	// 	};

	// 	await api
	// 		.post("/api/blogs")
	// 		.send(newBlog)
	// 		.expect(201);

	// 	let response = await api.get("/api/blogs");
	// 	const blogId = response.body[response.body.length - 1].id;

	// 	response = await api.put(`/api/blogs/${blogId}`, updatedBlog);
	// 	expect(response.body.title).toBe("React v17.0.0 and the Roadmap Update");
	// });
});

describe("API rejects", () => {
	beforeEach(async () => {
		await BlogPost.deleteMany({});
	});

	test("new blog posts without title or url fields", async () => {
		const newBlog = {
			author: "Dan Abramov and Brian Vaughn",
			likes: "0"
		};

		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(400);
	});
});

afterAll(async () => {
	await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
	mongoose.connection.close();
});
