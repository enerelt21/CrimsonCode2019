const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const passport = require('passport');

exports.createUser = (req, res, next) => {
    passport.authenticate('signup', async (err, user, info) => {
        try {
            if (err || !user) {
                return res.status(404).json({message: info.message});
            }
            return res.status(201).json({
                message: 'User created!',
            });
        } catch (e) {
            next(e);
        }
    })(req, res, next);
};

exports.userLogin = (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            return general_login(err, user, info, req, res, next);
        } catch (e) {
            return next(e);
        }
    })(req, res, next);
};

exports.getUser = async (req, res, next) => {
    try {
        let userId = req.user.userId;
        let exclude = ['createdAt', 'updatedAt', 'hash', 'password'];
        if (req.params.id) {
            userId = req.params.id;
            exclude = ['createdAt', 'updatedAt', 'hash', 'password', 'birthday', 'address1', 'address2', 'city', 'state', 'zipCode', 'phoneNumber'];
        }
        const user = await User.findOne({
            where: {id: userId},
            attributes: {exclude},
            include: [{
                model: UsersBadges,
                attributes: ['id'],
                include: [{
                    model: Badge,
                    attributes: ['id', 'name', 'description', 'picUrl']
                }]
            }]
        });
        if (user) {
            const userJSON = user.toJSON();
            userJSON['Badges'] = userJSON['UsersBadges'].map(u => u['Badge']);
            delete userJSON['UsersBadges'];
            return res.status(200).json(userJSON);
        } else {
            return res.status(404).json({
                message: 'User not found'
            })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: 'Server not available',
        })
    }
};


function general_login(err, user, info, req, res, next) {
    if (err || !user) {
        return res.status(404).json({message: info.message});
    }
    req.login(user, {session: false}, async (error) => {
        if (error) return next(error);
        const body = {userId: user.userId || user.id, email: user.email, level: user.level};
        const token = jwt.sign(
            body,
            process.env.CC2019_JWT_KEY,
            { expiresIn: '10d' }
        );
        return res.status(200).json({
            token: token,
            expiresIn: 3600*24*10,
            level: user.level,
            userId: user.userId || user.id
        });
    })
}
