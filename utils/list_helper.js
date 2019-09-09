const dummy = blogs => {
	return 1;
};

const totalLikes = blogs => {
	const total = blogs.reduce((acc, blog) => acc + blog.likes, 0);
	return isNaN(total) ? 0 : total;
};

module.exports = {
	dummy,
	totalLikes
};
