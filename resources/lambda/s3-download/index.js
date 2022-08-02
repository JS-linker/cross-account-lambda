const AWS = require("aws-sdk");
const sts = new AWS.STS();

exports.handler = async () => {
  const data = await sts
    .assumeRole({
      RoleArn: "arn:aws:iam::143607967676:role/CrossAccoutS3OfKeepaRole",
      RoleSessionName: "cross-account-s3-session",
    })
    .promise();
  console.log("data", data.Credentials);
  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: data.Credentials.AccessKeyId,
      secretAccessKey: data.Credentials.SecretAccessKey,
      sessionToken: data.Credentials.SessionToken,
    },
  });

  try {
    const file = await s3
      .getObject({
        Bucket: "cobalt-market-segments-dev",
        Key: "KeepaData/raw/us/1659312000000/B09YLL9NXG.json",
      })
      .promise();

    console.log("file", file);
  } catch (e) {
    console.log(e);
  }
};
