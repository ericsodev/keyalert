import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface DatabaseConstructProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  allowSecurityGroups: ec2.SecurityGroup[];
  stage: "production" | "development";
}

export class DatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: DatabaseConstructProps) {
    super(scope, id, props);

    const { vpc, allowSecurityGroups } = props;

    const database = new rds.DatabaseInstance(this, "keyalert-database", {
      instanceIdentifier: "keyalert-database",
      databaseName: "keyalert",
      credentials: {
        username: "postgres",
        secretName: "keyalert-db-credentials",
      },
      //@ts-expect-error internal aws strict error
      vpc,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17_2,
      }),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      backupRetention: cdk.Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      multiAz: false,
    });

    for (const securityGroup of allowSecurityGroups) {
      database.connections.allowDefaultPortFrom(securityGroup);
    }
  }
}
