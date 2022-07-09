import { describe } from "@jest/globals";
import { DiskRuleRepository } from "../src/repositories/DiskRuleRepository";

describe("RuleRepository Tests", () => {
  let ruleRepository: DiskRuleRepository;

  beforeAll(async () => {
    ruleRepository = new DiskRuleRepository("./rules.csv");
    await ruleRepository.init();
  });

  test("should return rule given all values match", async () => {
    const postalCode = "12003";
    const city = "Berlin";
    const street = "street a";
    const streetNumber = "123";
    const params = {
      queryPostalCode: postalCode,
      queryCity: city,
      queryStreet: street,
      queryStreetNumber: streetNumber,
    };

    const expectedRule = `${postalCode},${city},${street},${streetNumber}`;

    const rules = await ruleRepository.query(params);

    expect(rules === expectedRule).toEqual(true);
  });

  test("should return rule given some params match (greedy match)", async () => {
    const postalCode = "12004";
    const city = "Frankfurt";
    const street = "street f";
    const streetNumber = "314";
    const params = {
      queryPostalCode: postalCode,
      queryCity: city,
      queryStreet: street,
      queryStreetNumber: streetNumber,
    };

    const expectedRule = `${postalCode},${city},,`;

    const rules = await ruleRepository.query(params);

    expect(rules === expectedRule).toEqual(true);
  });

  test("should not return rules given some params match", async () => {
    const postalCode = "12000";
    const city = "Berlin";
    const street = "street b";
    const streetNumber = "456";
    const params = {
      queryPostalCode: postalCode,
      queryCity: city,
      queryStreet: street,
      queryStreetNumber: streetNumber,
    };

    const rules = await ruleRepository.query(params);

    expect(rules).toEqual("");
  });
});
