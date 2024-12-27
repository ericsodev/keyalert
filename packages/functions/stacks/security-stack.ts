import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface SecurityStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  whitelistedIps: string[];
}

export class SecurityStack extends cdk.Stack {
  public readonly bastionSecurityGroup: ec2.SecurityGroup;
  public readonly internalLambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityStackProps) {
    super(scope, id, props);

    this.internalLambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      "InternalLambdaSecurityGroup",
      { vpc: props.vpc, securityGroupName: "internal-lambda-security-group" },
    );

    this.bastionSecurityGroup = new ec2.SecurityGroup(
      this,
      "BastionSecurityGroup",
      { vpc: props.vpc, securityGroupName: "bastion-security-group" },
    );

    for (const ip of props.whitelistedIps) {
      this.bastionSecurityGroup.addIngressRule(
        ec2.Peer.ipv4(ip),
        ec2.Port.tcp(22),
        "Bastion SSH",
      );
    }
  }
}
