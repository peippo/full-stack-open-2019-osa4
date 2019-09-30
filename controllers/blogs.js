const blogsRouter = require("express").Router();
const BlogPost = require("../models/blogPost");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getTokenFrom = request => {
	const authorization = request.get("authorization");
	if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
		return authorization.substring(7);
	}
	return null;
};

blogsRouter.get("/", async (request, response) => {
	const blogs = await BlogPost.find({}).populate("user", {
		username: 1,
		name: 1
	});
	response.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.post("/", async (request, response, next) => {
	const body = request.body;

	const token = getTokenFrom(request);

	try {
		const decodedToken = jwt.verify(token, process.env.SECRET);
		if (!token || !decodedToken.id) {
			return response
				.status(401)
				.json({ error: "token missing or invalid" });
		}

		const user = await User.findById(decodedToken.id);

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
	} catch (exception) {
		next(exception);
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
