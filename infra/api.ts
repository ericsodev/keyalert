import { mainVpc } from "./network";

export const apiGateway = new sst.aws.ApiGatewayV2("Api", { vpc: mainVpc });
