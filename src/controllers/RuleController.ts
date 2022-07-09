import { Request, Response } from "express";
import { RuleRepository } from "../repositories/RuleRepository";

export class RuleController {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async query(req: Request, res: Response) {
    try {
      const { postalCode, city, street, streetNumber } = req.query;
      if (!postalCode || !city || !street || !streetNumber) {
        return res
          .status(400)
          .send(
            "All query params are required. Expected postalCode, city, street and streetNumber"
          );
      }

      const rules = await this.ruleRepository.query({
        queryPostalCode: postalCode as string,
        queryCity: city as string,
        queryStreet: street as string,
        queryStreetNumber: streetNumber as string,
      });

      return res.send(rules);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error");
    }
  }
}
