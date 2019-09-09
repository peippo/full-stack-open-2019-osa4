const dummy = () => {
	return 1;
};

const totalLikes = blogs => {
	const total = blogs.reduce((acc, blog) => acc + blog.likes, 0);
	return isNaN(total) ? 0 : total;
};

const mostLikes = blogs => {
	let mostLiked = blogs[0];
	blogs.map(blog => {
		if (blog.likes >= mostLiked.likes) {
			mostLiked = blog;
		}
	});

	return mostLiked;
};

module.exports = {
	dummy,
	totalLikes,
	mostLikes
};
