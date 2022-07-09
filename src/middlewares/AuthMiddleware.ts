import { NextFunction, Request, Response } from "express";

export class AuthMiddleware {
  execute(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers["authorization"];
    if (!authorization) {
      return res.status(401).send("Unauthorized");
    }

    if (authorization !== process.env.API_KEY) {
      return res.status(401).send("Unauthorized");
    }

    next();
  }
}
