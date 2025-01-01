import * as cdk from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

interface Props extends cdk.StackProps {
  stage: "production" | "development";
}

export class SecretsStack extends cdk.Stack {
  public redditCredentialSecret!: Secret;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    this.redditCredentialSecret = new Secret(this, "RedditCredentialSecret", {
      secretName: "/reddit/api-credentials",
      secretObjectValue: {},
    });
  }
}
