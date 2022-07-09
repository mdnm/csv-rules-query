import { S3 } from "aws-sdk";
import { Transform } from "stream";
import { RuleQueryParams, RuleRepository } from "./RuleRepository";

type ParsePayloadToStringResolveCallback = (value: string) => void;
type GetFileAsTransformResolveCallback = (value: Transform) => void;

type S3PayloadDataEvents = {
  Records?: S3.RecordsEvent;
  Stats?: S3.StatsEvent;
  Progress?: S3.ProgressEvent;
  Cont?: S3.ContinuationEvent;
  End?: S3.EndEvent;
};

enum FileHeaderInfo {
  NO_HEADER = "NO",
  HEADER_NOT_USED_IN_EXPRESSION = "IGNORE",
  HEADER_USED_IN_EXPRESSION = "Use",
}

export class S3RuleRepository implements RuleRepository {
  private s3Client: S3;
  private s3SelectParams: S3.SelectObjectContentRequest;

  constructor(private csvPath: string) {
    this.s3Client = new S3({
      region: process.env.S3_BUCKET_REGION,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      },
    });

    this.s3SelectParams = {
      Bucket: process.env.S3_BUCKET,
      Key: this.csvPath,
      ExpressionType: "SQL",
      Expression: "",
      InputSerialization: {
        CSV: {
          RecordDelimiter: "\n",
          FieldDelimiter: ",",
          FileHeaderInfo: FileHeaderInfo.HEADER_USED_IN_EXPRESSION,
        },
      },
      OutputSerialization: {
        CSV: {
          RecordDelimiter: "\n",
          FieldDelimiter: ",",
        },
      },
    };
  }

  async query(params: RuleQueryParams) {
    this.s3SelectParams.Expression = this.getSelectExpression(params);
    const csvPayload = await this.getFileAsTransform(this.s3SelectParams);
    return this.parsePayloadToString(csvPayload);
  }

  private getSelectExpression(params: RuleQueryParams): string {
    return `
      SELECT * 
        FROM s3object s
      WHERE 
        (s.postalCode='${params.queryPostalCode}' OR s.postalCode='')
        AND (s.city='${params.queryCity}' OR s.city='')
        AND (s.street='${params.queryStreet}' OR s.street='') 
        AND (s.streetNumber='${params.queryStreetNumber}' OR s.streetNumber='');
    `;
  }

  private parsePayloadToString(payload: Transform) {
    return new Promise(
      (resolve: ParsePayloadToStringResolveCallback, reject) => {
        const rules = [];

        payload.on("data", (event: S3PayloadDataEvents) => {
          if (event.Records) {
            rules.push(event.Records.Payload);
          }
        });

        payload.on("error", reject);

        payload.on("end", () => {
          try {
            resolve(Buffer.concat(rules).toString("utf8"));
          } catch (e) {
            reject(new Error("unable to convert S3 data to string"));
          }
        });
      }
    );
  }

  private async getFileAsTransform(request: S3.SelectObjectContentRequest) {
    return new Promise((resolve: GetFileAsTransformResolveCallback, reject) => {
      this.s3Client.selectObjectContent(request, (err, data) => {
        if (err) {
          return reject(err);
        }

        if (!data) {
          return reject(new Error("no output returned from s3 select"));
        }

        if (data.Payload instanceof Transform) {
          return resolve(data.Payload);
        }

        reject(
          new Error("something went wrong when trying to get the file from s3")
        );
      });
    });
  }
}
