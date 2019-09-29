const blogsRouter = require("express").Router();
const BlogPost = require("../models/blogPost");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
	const blogs = await BlogPost.find({}).populate("user", {
		username: 1,
		name: 1
	});
	response.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.post("/", async (request, response) => {
	const body = request.body;

	const user = await User.findById(body.userId);

	const blog = new BlogPost({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes === undefined ? 0 : body.likes,
		user: user._id
	});

	if (blog.title === undefined || blog.url === undefined) {
		response.status(400).end();
	} else {
		const savedBlog = await blog.save();
		user.blogs = user.blogs.concat(savedBlog._id);
		await user.save();
		response.status(201).json(savedBlog);
	}
});

blogsRouter.delete("/:id", async (request, response) => {
	await BlogPost.findByIdAndRemove(request.params.id);
	response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
	const updatedBlog = {
		title: request.body.title,
		author: request.body.author,
		url: request.body.url,
		likes: request.body.likes
	};

	const result = await BlogPost.findByIdAndUpdate(
		request.params.id,
		updatedBlog,
		{
			new: true
		}
	);
	response.status(200).json(result);
});

module.exports = blogsRouter;
