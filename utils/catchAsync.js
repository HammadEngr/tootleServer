module.exports = (fx) => (req, res, next) => fx(req, res, next).catch(next);
