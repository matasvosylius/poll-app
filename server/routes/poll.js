const router = require('express').Router();

const handle = require('../handlers');
const auth = require('../middlewares/auth');

router
    .route('/')
    .get(handle.showPolls)
    .post(auth, handle.createPoll);

router.get('/user', auth, handle.userPolls);

router.get('/history', auth, handle.userHistory);

router
.route('/:id')
.get(auth, handle.getPoll)
.post(auth, handle.vote)
.delete(auth, handle.deletePoll)

module.exports = router;