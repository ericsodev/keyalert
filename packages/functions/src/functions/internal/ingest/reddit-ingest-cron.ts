import { enqueueSqs } from "@utils/aws/sqs";

const queueName = process.env["INGEST_QUEUE_NAME"] ?? "";

export const handler = async (): Promise<string> => {
  const response = await enqueueSqs(queueName, "test queue thing");
  console.log(response);
  return "foobar";
};
