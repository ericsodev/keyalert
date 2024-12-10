export const mainVpc = new sst.aws.Vpc("MainVpc", {
  bastion: true,
  nat: "ec2",
});
