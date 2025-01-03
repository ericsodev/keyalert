import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface Props extends cdk.StackProps {
  stage: "production" | "development";
}

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: Props) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, "keyalert-main-vpc", {
      vpcName: "keyalert-main-vpc",
      natGateways: 1,
      maxAzs: 2,
    });

    this.vpc = vpc;
  }
}
