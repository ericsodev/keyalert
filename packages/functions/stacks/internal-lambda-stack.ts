import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import { NodeLambdaConstruct } from "../constructs/node-lambda";
import { Effect } from "aws-cdk-lib/aws-iam";
import { SecretsStack } from "./secrets-stack";

interface Props extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc;
  securityGroup: cdk.aws_ec2.SecurityGroup;
  stage: "production" | "development";
  secrets: SecretsStack;
}

export class InternalLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const parametersAndSecretsExtension = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "ParametersAndSecretsLambdaExtension",
      "arn:aws:lambda:us-east-1:177933569100:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12",
    );

    const dbSecret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      "keyalert-database-secret",
      "keyalert-db-credentials",
    );

    let dbConfig = {};

    if (props.stage === "production") {
      dbConfig = {
        DB_USER: dbSecret.secretValueFromJson("username").unsafeUnwrap(),
        DB_PASSWORD: dbSecret.secretValueFromJson("password").unsafeUnwrap(),
        DB_NAME: dbSecret.secretValueFromJson("dbname").unsafeUnwrap(),
        DB_HOST: dbSecret.secretValueFromJson("host").unsafeUnwrap(),
        DB_PORT: dbSecret.secretValueFromJson("port").unsafeUnwrap(),
      };
    } else {
      // The DB_HOST is set to the docker container url when running lambdas locally.
      // Otherwise for migration/seed purposes we use localhost to connect to postgres
      dbConfig = {
        DB_HOST: "docker.for.mac.host.internal",
      };
    }

    new NodeLambdaConstruct(this, "DatabaseHeartbeat", {
      entry: path.resolve(__dirname, "../src/functions/internal/db/heartbeat.ts"),
      env: {
        NODE_ENV: props.stage,
        ...dbConfig,
      },
      layers: [parametersAndSecretsExtension],
      functionName: "db-heartbeat",
      securityGroup: props.securityGroup,
      // @ts-expect-error aws lib error
      vpc: props.vpc,
    });

    new NodeLambdaConstruct(this, "RedditIngestManual", {
      entry: path.resolve(__dirname, "../src/functions/internal/ingest/reddit-ingest-manual.ts"),
      env: {
        NODE_ENV: props.stage,
        ...dbConfig,
      },
      layers: [parametersAndSecretsExtension],
      functionName: "reddit-ingest-manual",
      securityGroup: props.securityGroup,
      // @ts-expect-error aws lib error
      vpc: props.vpc,
      policies: [
        new cdk.aws_iam.PolicyStatement({
          actions: [
            "secretsmanager:GetResourcePolicy",
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret",
            "secretsmanager:ListSecretVersionIds",
          ],
          effect: Effect.ALLOW,
          resources: [props.secrets.redditCredentialSecret.secretArn],
        }),
      ],
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMReadOnlyAccess"),
      ],
    });
  }
}
