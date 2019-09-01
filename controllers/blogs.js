const blogsRouter = require("express").Router();
const BlogPost = require("../models/blogPost");

blogsRouter.get("/", (request, response) => {
	BlogPost.find({}).then(blogs => {
		response.json(blogs.map(blog => blog.toJSON()));
	});
});

blogsRouter.post("/", (request, response) => {
	const blog = new BlogPost(request.body);

	blog.save().then(result => {
		response.status(201).json(result);
	});
});

module.exports = blogsRouter;
