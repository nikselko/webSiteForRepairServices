const User = require('../database/models/user')
const Order = require('../database/models/order')
const { failure, serverError } = require('../utils/responses')

module.exports = {
    isAuthorized: (req, res, next) => req.session.user ? next() : res.redirect('/authorization/login'),
    isAdmin: (req, res, next) => req.session.user.role === 'admin' ? next() : res.redirect('/authorization/login'),
    isEmployee: (req, res, next) => {
        if(req.session.user.role === 'admin') next()
        req.session.user.role === 'employee' ? next() : res.redirect('/authorization/login')
    },
    isUser: (req, res, next) => req.session.user.role === 'user' ? next() : res.redirect('/authorization/login'),
    isAuthor: async (req, res, next) => {
        try {
            const id = req.params.id
            if(!id) return res.status(400).json(failure('Id param required'))
            const order = await Order.findOne({
                _id: id
            })
            if(!order) return res.status(400).json(failure('Invalid id'))
            if(req.session.user.role === 'admin'|| req.session.user.role === 'employee' || order.author === req.session.user.login) {
                res.locals.order = order
                next()
            }
            else return res.status(401).json(failure('You are not an author'))
        }
        catch (e) {
            console.error(e)
            return res.status(500).json(serverError())
        }
    }
}
