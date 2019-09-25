const blogsRouter = require("express").Router();
const BlogPost = require("../models/blogPost");

blogsRouter.get("/", async (request, response) => {
	const blogs = await BlogPost.find({});
	response.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.post("/", async (request, response) => {
	const blog = new BlogPost(request.body);
	if (blog.likes === undefined) {
		blog.likes = 0;
	}

	if (blog.title === undefined || blog.url === undefined) {
		response.status(400).end();
	} else {
		const result = await blog.save();
		response.status(201).json(result);
	}
});

module.exports = blogsRouter;
