const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');
const withAuth = require('../../utils/auth');


// Render dashboard with all posts ever created by the user logged in
// Endpoint is '/dashboard/:userId'
// TODO: only authenticated users can access their dashboard
// TODO: once we have set up our sessions, remove ':userId' from endpoint and get userId from req.sessions instead
router.get('/:userId', withAuth, async (req, res) => {
	try {
		const posts = await Post.findAll({
			where: {
				// TODO: eventually, get userId from req.sessions instead of req.params
				userId: req.params.userId,
			},
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

		res.status(200).render('dashboard',{
			posts: serializedPosts,
			username: req.session.username,
			loggedIn: req.session.loggedIn,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

// Render dashboard view for a single post created by the user logged in
// Endpoint is '/dashboard/post/:id'
router.get('/post/:id', async (req, res) => {
	try {
		let post = await Post.findOne({
			where: {
				id: req.params.id,
				// TODO: might need to verify that post belongs to user attempting to view it (userId will come from req.sessions once we have set up our sessions)
				// userId: req.session.userId
			},
			include: [
				{ model: Comment, include: { model: User, attributes: ['username'] } },
			],
			attributes: {
				include: [
					// Use plain SQL to get count of the number of comments
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

		console.log(post)

		// TODO: modify response with actual VIEW|template
		res
			.status(200)
			.render('dashboardSingle',{
				post: post,
				username: req.session.username,
				loggedIn: req.session.loggedIn,
			});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

module.exports = router;