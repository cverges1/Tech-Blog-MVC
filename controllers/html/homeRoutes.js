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
			id: req.session.userId,
			username: req.session.username,
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

		const serializedPost = post.get({ plain: true });
		console.log("posts",serializedPost);
		console.log("comments",serializedPost.comments);


		// TODO: modify response with actual VIEW|template
		res.status(200).render( 'singlePost',{
			post: serializedPost,
			comments: serializedPost.comments,
			loggedIn: req.session.loggedIn,
		});
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