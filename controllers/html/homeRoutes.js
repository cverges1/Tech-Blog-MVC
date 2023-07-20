const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');

// Render homepage with all existing posts
router.get('/', async (req, res) => {
	try {
		const posts = await Post.findAll({
			include: [{ model: User, attributes: ['username'] }],
			attributes: {
				include: [
					// Use plain SQL to get a count of the number of comments for each post
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.postId = post.id)'
						),
						'commentsCount',
					],
				],
			},
		});
		const serializedPosts = posts.map((post) => post.get({ plain: true }));
		console.log(serializedPosts);
		res.status(200).render('homepage', {
			posts: serializedPosts,
			loggedIn: req.session.loggedIn,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

// Render single-post page with selected post
router.get('/post/:id', async (req, res) => {
	try {
		let post = await Post.findByPk(req.params.id, {
			include: [
				{ model: User, attributes: ['username'] },
				{ model: Comment, include: { model: User, attributes: ['username'] } },
			],
			attributes: {
				include: [
					// Use plain SQL to get a count of the number of comments for each post
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.postId = post.id)'
						),
						'commentsCount',
					],
				],
			},
		});

		if (!post) return res.status(404).json({ message: 'No post found.' });

		post = post.get({ plain: true });
		console.log(post);

		// TODO: modify response with actual VIEW|template
		res
			.status(200)
			.send(
				'<h1>SINGLE POST PAGE</h1><h2>Render the view for a single post along with the post retrieved.</h2>'
			);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

// Render signup page
router.get('/signup', async (req, res) => {
	if (req.session.loggedIn) return res.status(200).redirect('/');
	res.status(200).render('signup');
});

// Render login page
router.get('/login', async (req, res) => {
	if (req.session.loggedIn) return res.status(200).redirect('/');
	res.status(200).render('login');
});

module.exports = router;