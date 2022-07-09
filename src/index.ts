import express from "express";
import "./config/env";
import { RuleController } from "./controllers/RuleController";
import { AuthMiddleware } from "./middlewares/AuthMiddleware";
import { S3RuleRepository } from "./repositories/S3RuleRepository";

function bootstrap() {
  const ruleRepository = new S3RuleRepository("rules.csv");
  const ruleController = new RuleController(ruleRepository);
  const authMiddleware = new AuthMiddleware();

  const app = express();
  app.get("/health", (_, res) => res.sendStatus(200));
  app.use(authMiddleware.execute);
  app.get("/rules/query", ruleController.query.bind(ruleController));
  return app;
}

bootstrap().listen(process.env.PORT || 3000, () => {
  console.log("App started successfully");
});
