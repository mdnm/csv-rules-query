import * as fs from "fs/promises";
import { RuleQueryParams, RuleRepository } from "./RuleRepository";

export class DiskRuleRepository implements RuleRepository {
  private rules: string[];

  constructor(private csvPath: string) {}

  async init() {
    const csv = await fs.readFile(this.csvPath, { encoding: "utf-8" });
    const [header, ...rows] = csv.split("\n");

    if (header !== "PostalCode,City,Street,StreetNumber") {
      throw new Error(
        "Incorrect Headers. It should be: PostalCode,City,Street,StreetNumber"
      );
    }

    this.rules = rows;
  }

  async query({
    queryPostalCode,
    queryCity,
    queryStreet,
    queryStreetNumber,
  }: RuleQueryParams) {
    return this.rules
      .filter((rule) =>
        this.matchRule(rule, {
          queryPostalCode,
          queryCity,
          queryStreet,
          queryStreetNumber,
        })
      )
      .join("\n");
  }

  private matchRule(rule: string, query: RuleQueryParams) {
    const [postalCode, city, street, streetNumber] = rule.split(",");
    const { queryPostalCode, queryCity, queryStreet, queryStreetNumber } =
      query;

    if (postalCode !== queryPostalCode && postalCode !== "") {
      return null;
    }
    if (city !== queryCity && city !== "") {
      return null;
    }
    if (street !== queryStreet && street !== "") {
      return null;
    }
    if (streetNumber !== queryStreetNumber && streetNumber !== "") {
      return null;
    }

    return rule;
  }
}
