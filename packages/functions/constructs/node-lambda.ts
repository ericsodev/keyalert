import { ILayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";

interface Props {
  entry: string;
  vpc: IVpc;
  securityGroup: ISecurityGroup;
  functionName: string;
  env: Record<string, string> & { NODE_ENV: string };
  layers?: ILayerVersion[];
  lambdaProps?: NodejsFunctionProps;
  policies?: iam.PolicyStatement[];
  managedPolicies?: iam.IManagedPolicy[];
}

export class NodeLambdaConstruct extends Construct {
  public lambda!: NodejsFunction;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const iamRoleForLambda = new iam.Role(this, `${id}Role`, {
      roleName: `${props.functionName}-role`,
      // @ts-expect-error internal aws typescript error
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
        ...(props.managedPolicies ?? []),
      ],
    });

    for (const policy of props?.policies ?? []) {
      iamRoleForLambda.addToPolicy(policy);
    }

    this.lambda = new NodejsFunction(this, id, {
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: true,
        target: "esnext",
      },

      // @ts-expect-error internal aws lib
      role: iamRoleForLambda,
      entry: props.entry,
      timeout: cdk.Duration.seconds(15),
      handler: "handler",
      memorySize: 256,
      vpc: props.vpc,
      securityGroups: [props.securityGroup],
      functionName: props.functionName,
      environment: props.env,
      ...props.lambdaProps,
    });

    if (props.layers) {
      this.lambda.addLayers(...props.layers);
    }
  }
}
