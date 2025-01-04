import SQS from "aws-sdk/clients/sqs";
import { z } from "zod";
//
export async function enqueueSqs(queueName: string, message: string) {
  const accountRegion = await z.string().parseAsync(process.env["AWS_ACCOUNT_REGION"]);

  const queueUrl = await getSqsUrl(queueName);
  const sqsClient = new SQS({ region: accountRegion });

  const response = await sqsClient
    .sendMessage({
      MessageBody: message,
      QueueUrl: queueUrl,
    })
    .promise();

  return response;
}

export async function getSqsUrl(queueName: string): Promise<string> {
  const [accountId, accountRegion] = await Promise.all([
    z.string().parseAsync(process.env["AWS_ACCOUNT_ID"]),
    z.string().parseAsync(process.env["AWS_ACCOUNT_REGION"]),
  ]);

  return `https://sqs.${accountRegion}.amazonaws.com/${accountId}/${queueName}`;
}
