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

    // Lookup existing keypair
    const keypair = ec2.KeyPair.fromKeyPairName(
      this,
      "BastionKeyPair",
      "bastion-ssh-key",
    );

    const bastionHost = new ec2.Instance(this, "BastionHost", {
      vpc: vpc,
      securityGroup: securityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO,
      ),
      instanceName: "bastion-host",
      keyPair: keypair,
    });

    const profile = this.node.tryGetContext("profile");

    // Display commands for connect bastion host using ec2 instance connect
    const createSshKeyCommand = "ssh-keygen -t rsa -f my_rsa_key";
    const pushSshKeyCommand = `aws ec2-instance-connect send-ssh-public-key --region ${cdk.Aws.REGION} --instance-id ${bastionHost.instanceId} --availability-zone ${bastionHost.instanceAvailabilityZone} --instance-os-user ec2-user --ssh-public-key file://my_rsa_key.pub ${profile ? `--profile ${profile}` : ""}`;
    const sshCommand = `ssh -o "IdentitiesOnly=yes" -i my_rsa_key ec2-user@${bastionHost.instancePublicDnsName}`;

    new cdk.CfnOutput(this, "CreateSshKeyCommand", {
      value: createSshKeyCommand,
    });
    new cdk.CfnOutput(this, "PushSshKeyCommand", { value: pushSshKeyCommand });
    new cdk.CfnOutput(this, "SshCommand", { value: sshCommand });
  }
}
