const db = require('../models');

exports.showPolls = async (req, res, next) => {
    try {
        const polls = await db.Poll
        .find({expireDate: {"$gte": new Date(Date.now()).toISOString()}})
        .populate('user', ['username', 'id']);

        res.status(200).json(polls)

    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.userPolls = async (req, res, next) => {
    try {
        const { id } = req.decoded;

        let user = await db.User
        .findById(id)
        .populate( {"path": "polls",
        "match": { "expireDate": { "$gte": new Date(Date.now()).toISOString()}}
    })

        res.status(200).json(user.polls)

    } catch (err) {
        err.status = 400;
        next(err)
    }
};


exports.getPoll = async (req, res, next) => {
    try {
        const { id } = req.params;

        const poll = await db.Poll.findById(id)
            .populate('user', ['username', 'id']);


        res.status(200).json(poll)

    } catch (err) {
        err.status = 400;
        err.message = 'Poll not found'
        next(err)
    }
};

exports.createPoll = async (req, res, next) => {

    try {
        const { id } = req.decoded;
        const user = await db.User.findById(id);

        const { question, options, expireDate } = req.body;

        const poll = await db.Poll.create({
            question,
            user,
            options: options.map(option =>
                ({
                    option,
                    votes: 0
                })),
            expireDate

        });

        user.polls.push(poll._id);
        await user.save();

        res.status(201).json
            ({
                ...poll._doc,
                user: user._id
            });

    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.vote = async (req, res, next) => {

    try {

        const { id: pollId } = req.params;
        const { id: userId } = req.decoded;
        const { answer } = req.body;
        
        if (answer) {

            const poll = await db.Poll.findById(pollId);
            if (!poll) throw new Error('Poll not found');

            const active = await db.Poll
            .findById(pollId)
            .find({expireDate: {"$gte": new Date(Date.now()).toISOString()}});
            if(!active.length) throw new Error('Poll has expired')


            const vote = poll.options.map(
                option => {
                    if (option.option === answer) {
                        return {
                            option: option.option,
                            _id: option._id,
                            votes: option.votes + 1
                        }
                    } else {
                        return option;
                    }
                }
            );

            if (poll.voted.filter(user => user.toString() === userId).length <= 0) {
                poll.voted.push(userId);
                poll.options = vote;
                await poll.save();

                return res.status(202).json(poll)

            } else {
                throw new Error("This user already voted");
            }
        } else {
            throw new Error('Answer is not provided')
        }
    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.deletePoll = async (req, res, next) => {
    try {

        const { id: pollId } = req.params;
        const { id: userId } = req.decoded;

        const poll = await db.Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');

        if (poll.user.toString() !== userId) {
            throw new Error("Unauthorized access");
        }

        await poll.remove()
        res.status(202).json(poll);


    } catch (err) {
        err.status = 400;
        next(err);
    }
};