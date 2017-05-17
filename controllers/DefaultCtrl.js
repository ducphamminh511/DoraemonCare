var BookCtrl = require('./BookCtrl');

module.exports.getBooks = (req, res, next) => {
    BookCtrl.getBooks(req, res, next);
};