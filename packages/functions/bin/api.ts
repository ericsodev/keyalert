#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../stacks/vpc-stack";
import { SecurityStack } from "../stacks/security-stack";
import { BastionStack } from "../stacks/bastion-stack";
import { DatabaseStack } from "../stacks/database-stack";
import * as dotenv from "dotenv";

dotenv.config();

const localIp = process.env["LOCAL_IP"];
if (!localIp) throw new Error("Missing local whitelisted IP");

const app = new cdk.App();
const vpc = new VpcStack(app, "VpcStack", {
  stackName: "vpc-stack",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const securityStack = new SecurityStack(app, "SecurityStack", {
  vpc: vpc.vpc,
  stackName: "security-stack",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  whitelistedIps: [localIp],
});

const bastion = new BastionStack(app, "BastionStack", {
  securityGroup: securityStack.bastionSecurityGroup,
  vpc: vpc.vpc,
  stackName: "bastion-stack",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const rds = new DatabaseStack(app, "DatabaseStack", {
  bastionSecurityGroup: securityStack.bastionSecurityGroup,
  vpc: vpc.vpc,
  stackName: "database-stack",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
