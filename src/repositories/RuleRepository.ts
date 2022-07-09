export abstract class RuleRepository {
  abstract query(params: RuleQueryParams): Promise<string>;
}

export interface RuleQueryParams {
  queryPostalCode: string;
  queryCity: string;
  queryStreet: string;
  queryStreetNumber: string;
}
