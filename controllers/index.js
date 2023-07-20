const router = require('express').Router();

const apiRoutes = require('./api');
const htmlRoutes = require('./html');

router.use('/api', apiRoutes);
router.use('/', htmlRoutes);

router.use((req, res) => res.status(400).send('<h1>Whoops! Wrong Page!</h1>'));

module.exports = router;