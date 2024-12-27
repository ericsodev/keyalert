import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { lambdas } from "../src/functions/internal/lambdas";
import * as path from "path";

interface Props extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc;
  securityGroup: cdk.aws_ec2.SecurityGroup;
}

export class InternalLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const { vpc } = props;

    const parametersAndSecretsExtension =
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        "ParametersAndSecretsLambdaExtension",
        "arn:aws:lambda:us-east-1:177933569100:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12",
      );

    const outDir = path.resolve(__dirname, "../build/db-heartbeat/bundle");
    const outFile = path.join(outDir, "index.js");

    const dbSecret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      "keyalert-database-secret",
      "keyalert-db-credentials",
    );
    const dbUser = dbSecret.secretValueFromJson("username").unsafeUnwrap();
    const dbPass = dbSecret.secretValueFromJson("password").unsafeUnwrap();
    const dbName = dbSecret.secretValueFromJson("dbname").unsafeUnwrap();
    const dbHost = dbSecret.secretValueFromJson("host").unsafeUnwrap();
    const dbPort = dbSecret.secretValueFromJson("port").unsafeUnwrap();

    const dbHeartbeatFunction = new lambda.Function(this, "DatabaseHeartbeat", {
      code: lambda.Code.fromAsset(outDir),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(29),
      vpc: vpc,
      functionName: "db-heartbeat",
      securityGroups: [props.securityGroup],
      environment: {
        NODE_ENV: "production",
        DB_NAME: dbName,
        DB_USER: dbUser,
        DB_PASSWORD: dbPass,
        DB_HOST: dbHost,
        DB_PORT: dbPort,
      },
    });

    dbHeartbeatFunction.addLayers(parametersAndSecretsExtension);
  }
}
