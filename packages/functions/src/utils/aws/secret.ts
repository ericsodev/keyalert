import { inspect } from "util";

export const getParameter = async (parameterName: string): Promise<string> => {
  const token = process.env["AWS_SESSION_TOKEN"]; // Token generated in lambda layer at runtime

  if (token === undefined) {
    throw new Error("Missing AWS Session token");
  }

  const response = await fetch(
    `http://localhost:2773/systemsmanager/parameters/get/?name=${encodeURIComponent(
      parameterName,
    )}&withDecryption=true`,
    {
      headers: {
        "X-Aws-Parameters-Secrets-Token": token,
      },
    },
  );
  const json = (await response.json()) as Record<string, unknown>;
  const parameter = json["Parameter"];
  if (parameter === undefined) {
    throw new Error(`Parameter error: ${inspect(response, { depth: undefined })}`);
  }
  const value = (parameter as Record<string, string>)["Value"];

  if (value === undefined) {
    throw new Error(`Parameter error: ${inspect(response, { depth: undefined })}`);
  }

  return value;
};

export const getSecret = async (secretName: string): Promise<string> => {
  const token = process.env["AWS_SESSION_TOKEN"]; // Token generated in lambda layer at runtime

  if (token === undefined) {
    throw new Error("Missing AWS Session token");
  }

  const response = await fetch(
    `http://localhost:2773/secretsmanager/get?secretId=${encodeURIComponent(secretName)}`,
    {
      headers: {
        "X-Aws-Parameters-Secrets-Token": token,
      },
    },
  );
  const json = (await response.json()) as Record<string, unknown>;
  const secret = json["SecretString"] as string;
  if (!secret) {
    throw new Error(`Secret error: ${inspect(json, { depth: undefined })}`);
  }

  return secret;
};
