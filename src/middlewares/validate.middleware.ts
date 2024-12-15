import { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        }));
        return next({ status: 400, errors: formattedErrors });
      }
      next(error);
    }
  };
