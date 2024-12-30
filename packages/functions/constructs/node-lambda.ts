import { ILayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";

interface Props {
  entry: string;
  vpc: IVpc;
  securityGroup: ISecurityGroup;
  functionName: string;
  env: Record<string, string> & { NODE_ENV: string };
  layers?: ILayerVersion[];
  lambdaProps?: NodejsFunctionProps;
}

export class NodeLambdaConstruct extends Construct {
  public lambda!: NodejsFunction;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.lambda = new NodejsFunction(this, id, {
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: true,
        target: "esnext",
        externalModules: ["aws-sdk"],
      },
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
