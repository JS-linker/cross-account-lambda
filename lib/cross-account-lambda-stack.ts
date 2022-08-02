import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export class CrossAccountLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaRoleName = "CrossAccoutS3LambdaRole";
    const lambdaRole = new iam.Role(this, lambdaRoleName, {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: lambdaRoleName,
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "cross-accout-s3-lambda-role-policy", {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["s3:*"],
            resources: [
              "arn:aws:s3:::cobalt-market-segments-dev",
              "arn:aws:s3:::cobalt-market-segments-dev/KeepaData/*",
            ],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["sts:AssumeRole"],
            resources: [
              "arn:aws:iam::143607967676:role/CrossAccoutS3OfKeepaRole",
            ],
          }),
        ],
      })
    );

    new lambda.Function(this, "s3-download-file-handle", {
      code: lambda.Code.fromAsset("resources/lambda/s3-download"),
      handler: "index.handler",
      functionName: "S3DownloadFileHandle",
      runtime: lambda.Runtime.NODEJS_14_X,
      role: lambdaRole,
    });
  }
}
