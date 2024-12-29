import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

interface Props extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc;
  securityGroup: cdk.aws_ec2.SecurityGroup;
  stage: "production" | "development";
}

export class InternalLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const { vpc } = props;

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

    const dbHeartbeatFunction = new NodejsFunction(this, "DatabaseHeartbeat", {
      entry: path.resolve(__dirname, "../src/functions/internal/db/heartbeat.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
      // @ts-expect-error aws lib error
      vpc: vpc,
      functionName: "db-heartbeat",
      securityGroups: [props.securityGroup],
      environment: {
        NODE_ENV: props.stage,
        ...dbConfig,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: true,
        target: "esnext",
        externalModules: ["aws-sdk"],
      },
    });

    dbHeartbeatFunction.addLayers(parametersAndSecretsExtension);
  }
}
