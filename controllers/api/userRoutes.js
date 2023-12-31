// create instance of express Router
const router = require('express').Router();
// import our db connection for the SQL literals
const sequelize = require('../../config/connection');
// import models from 'models/index.js'
const { User, Post, Comment } = require('../../models');
// import helper function for authentication
const withAuth = require('../../utils/auth');

// Route to sign up a new user
// POST method with endpoint '/api/users/'
// test with: {"username": "testUser", "email": "testUser@email.com", "password": "Password123"}
router.post('/', async (req, res) => {
	console.log(req.body);
	try {
		// TODO: check if user already exists in DB and redirect to login instead
		// create new user
		const newUser = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
		});
		console.log('newUser', newUser);
		// save new session to db
		req.session.save(() => {
			// create session variables based on the newly signed up user
			(req.session.userId = newUser.id), (req.session.loggedIn = true);
			res.status(201).json(newUser); // 201 - Created
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

// Route to get all users for testing
//GET method end point '/api/users'
router.get('/', async (req, res) => {
	try {
		// retrieve all existing users from the database
		const users = await User.findAll({
		  attributes: {
			exclude: ["password"],
		  },
		});
		res.status(200).json(users); // 200 - OK
	  } catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	  }
})

// Route to retrieve logged in user's profile
// GET method with endpoint '/api/users/profile'
// Only authenticated users can retrieve their profile
router.get('/profile', withAuth, async (req, res) => {
	try {
		// retrieve user by his/her id -> since only logged in users can view their profile, id will come from req.session.userId
		const user = await User.findByPk(req.session.userId, {
			include: [
				{ model: Post },
				{ model: Comment, include: { model: Post, attributes: ['title'] } },
			],
			attributes: {
				exclude: ['password'],
				include: [
					// use plain SQL to get a count of the number of posts made by a user
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM post WHERE post.userId = user.id)'
						),
						'postsCount',
					],
					// use plain SQL to get a count of the number of comments made by a user
					[
						sequelize.literal(
							'(SELECT COUNT(*) FROM comment WHERE comment.userId = user.id)'
						),
						'commentsCount',
					],
				],
			},
		});

		if (!user) return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(200).json(user); // 200 - OK
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

/***** UPDATE - optional *****/
// Route to update a user by id
// PUT method with endpoint '/api/users/profile'
// test with any and all of: {"username": "updatedTestUser", "email": "updatedTestUser@email.com", "password": "updatedPassword123"}
// Only authenticated users can update their profile
router.put('/profile', withAuth, async (req, res) => {
	try {
		// pass in req.body to only update what's sent over by the client
		const updatedUser = await User.update(req.body, {
			where: {
				// since only logged in users can update their profile, id will come from req.session.userId
				id: req.session.userId,
			},
			individualHooks: true,
		});

		// if no user was updated, let client know the user was not found
		if (!updatedUser[0])
			return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(202).json(updatedUser); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

/***** DELETE - optional *****/
// Route to delete a user by id
// DELETE method with endpoint '/api/users/profile'
// Only authenticated users can delete their profile
router.delete('/profile', withAuth, async (req, res) => {
	try {
		const deletedUser = await User.destroy({
			where: {
				// since only logged in users can delete their account, id will come from req.session.userId
				id: req.session.userId,
			},
		});

		// if no user was deleted, let client know the user was not found
		if (!deletedUser)
			return res.status(404).json({ message: 'No user found.' }); // 404 - Not Found

		res.status(202).json(deletedUser); // 202 - Accepted
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

/***** LOGIN *****/
// Route to login an existing user
// POST method with endpoint '/api/users/login'
// expects {"email": "ascoullar0@feedburner.com", "password": "rO1(*`VV,"} --> test with any user from your seeds
router.post('/login', async (req, res) => {
	try {
		// retrieve user by his/her email
		const user = await User.findOne({
			where: { email: req.body.email },
		});

		// if no user found, send back response with 400 status code (stay vague)
		if (!user)
			return res.status(400).json({ message: 'Credentials not valid.' }); // 400 - Bad Request

		// use 'checkPassword' instance method to validate password provided at login
		const validPw = await user.checkPassword(req.body.password);
		// if password doesn't match, send back response with 400 status code (stay vague)
		if (!validPw)
			return res.status(400).json({ message: 'Credentials not valid.' }); // 400 - Bad Request

		// if we have reached that point, then user is validated and we want to create session variables and save a new session for that user in our database
		req.session.save(() => {
			// create session variables based on the logged in user
			req.session.userId = user.id;
			req.session.username = user.username;
			req.session.loggedIn = true;
			// send back response with 200 status code
			res.status(200).json(user); // 200 - OK
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error); // 500 - Internal Server Error
	}
});

/***** LOGOUT *****/
// Route to logout an existing user
// POST method with endpoint '/api/users/logout'
router.post('/logout', async (req, res) => {
	// if user was logged in, delete session from database
	if (req.session.loggedIn) {
		req.session.destroy(() => {
			// send back success status code, with no content
			res.status(204).end(); // 204 - No Content
		});
		// otherwise send back client error status code, with no content
	} else {
		res.status(404).end(); // 404 - Not Found
	}
});

module.exports = router;
