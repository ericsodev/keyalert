import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
  }
}
