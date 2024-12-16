"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    const errors = err.errors || null;
    res.status(status).json({
        message,
        errors,
    });
};
exports.errorHandler = errorHandler;
