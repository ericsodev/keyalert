#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../stacks/vpc-stack";
import { SecurityStack } from "../stacks/security-stack";
import { BastionStack } from "../stacks/bastion-stack";
import { DatabaseStack } from "../stacks/database-stack";
import * as dotenv from "dotenv";
import { InternalLambdaStack } from "../stacks/internal-lambda-stack";
import { z } from "zod";

const stage = z.enum(["production", "development"]).parse(process.env["NODE_ENV"]);

if (stage === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env.development" });
}

const localIp = process.env["LOCAL_IP"];
if (!localIp) throw new Error("Missing local whitelisted IP");

const envSchema = z.object({
  CDK_DEFAULT_ACCOUNT: z.string(),
  CDK_DEFAULT_REGION: z.string(),
});

const env = envSchema.parse(process.env);

const app = new cdk.App();
const vpc = new VpcStack(app, "VpcStack", {
  stackName: "vpc-stack",
  stage,
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
});

const securityStack = new SecurityStack(app, "SecurityStack", {
  vpc: vpc.vpc,
  stackName: "security-stack",
  stage,
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
  whitelistedIps: [localIp],
});

const bastion = new BastionStack(app, "BastionStack", {
  securityGroup: securityStack.bastionSecurityGroup,
  vpc: vpc.vpc,
  stackName: "bastion-stack",
  stage,
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
});

const rds = new DatabaseStack(app, "DatabaseStack", {
  stage,
  allowSecurityGroups: [
    securityStack.bastionSecurityGroup,
    securityStack.internalLambdaSecurityGroup,
  ],
  vpc: vpc.vpc,
  stackName: "database-stack",
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
});

const internalLambda = new InternalLambdaStack(app, "InternalLambdaStack", {
  stage,
  vpc: vpc.vpc,
  stackName: "internal-lambda-stack",
  securityGroup: securityStack.internalLambdaSecurityGroup,
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
});
