"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const formattedErrors = error.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
            }));
            return next({ status: 400, errors: formattedErrors });
        }
        next(error);
    }
};
exports.validate = validate;
