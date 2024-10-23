module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

// if my catchAsync error handler is not working then my server must have crashed. That was happening earlier.