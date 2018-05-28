const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
var auth = require('basic-auth')
const User = require('./../models/user');

const secretKey = "sdfsl24r234k2";

module.exports = (app) => {
    app.post('/signin',
        [
            check('firstName').exists(),
            check('lastName').exists(),
            check('tel').exists().isMobilePhone('uk-UA'),
            check('email').exists().isEmail(),
            check('password').exists(),
            check('meta').custom((field) => {
                if (field && !field.description) return false;
                return true;
            })
        ],
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ ok: false, errors: errors.mapped() });
            }
            User.create(req.body).then(user => {
                res.json({ok: true, user: user});
            }, err => {
                res.status(500).json({ok: false, err: err.message});
            });
        }
    );
    app.post('/login',
        [
            check('email').exists().isEmail(),
            check('password').exists()
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ ok: false, errors: errors.mapped() });
            }
            try {
                //TODO: change it because want to auth with email and pass instead of user name
                // var userAuth = auth(req);
                const user = await User.find({email: req.body.email, password: req.body.password});
                if (!user) throw new Error('Wrong password');
                const token = jwt.sign(user, secretKey);
                res.json({ok: true, token: token});
            } catch (err) {
                res.status(500).json({ok: false, err: err.message});
            }
        }
    );
    app.post('/delete',
        [
            check('user.id').exists().isNumeric(),
            check('token').exists()
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ ok: false, errors: errors.mapped() });
            }
            try {
                const user = jwt.verify(req.body.token, secretKey);
                if (!user) throw new Error('Forbidden');
                await User.delete(req.body.user.id);
                res.json({ok: true});
            } catch (err) {
                res.status(500).json({ok: false, err: err.message});
            }
        }
    );
    app.post('/logout',
        [
            check('user.id').exists().isNumeric(),
            check('token').exists()
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ ok: false, errors: errors.mapped() });
            }
            try {
                const user = jwt.verify(req.body.token, secretKey);
                if (!user) throw new Error('You are not logged in');
                if (user.id != req.body.user.id) throw new Error('Not valid token');

                //TODO: remove invalidate token
                res.json({ok: true});
            } catch (err) {
                res.status(500).json({ok: false, err: err.message});
            }
        }
    );
    app.post('/users',
        [
            check('token').exists()
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ ok: false, errors: errors.mapped() });
            }
            try {
                const user = jwt.verify(req.body.token, secretKey);
                if (!user) throw new Error('You are not logged in');
                const users = await User.findAll();
                //TODO: remove invalidate token
                res.json({ok: true, users});
            } catch (err) {
                res.status(500).json({ok: false, err: err.message});
            }
        }
    );
    app.post('/users/:id',
        [
            check('token').exists()
        ],
        async (req, res) => {
            req.checkParams('id', 'Parameter `id` should be').notEmpty();
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ ok: false, errors: errors.mapped() });
            }
            try {
                const user = jwt.verify(req.body.token, secretKey);
                if (!user) throw new Error('You are not logged in');
                const foundUser = await User.find({id: Number(req.params.id)});
                if (!foundUser) throw new Error('User not found');
                res.json({ok: true, user: foundUser});
            } catch (err) {
                res.status(500).json({ok: false, err: err.message});
            }
        }
    );
};