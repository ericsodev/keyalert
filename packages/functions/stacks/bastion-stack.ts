import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";

interface BastionConstructProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
}

export class BastionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BastionConstructProps) {
    super(scope, id, props);
    const { vpc, securityGroup } = props;

    // TODO: Add instructions on adding keypair before deploying to READMDE
    // Lookup existing keypair
    const keypair = ec2.KeyPair.fromKeyPairName(this, "BastionKeyPair", "bastion-ssh-key");

    new ec2.Instance(this, "BastionHost", {
      // @ts-expect-error aws lib error
      vpc: vpc,
      securityGroup: securityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      instanceName: "bastion-host",
      keyPair: keypair,
    });
  }
}
