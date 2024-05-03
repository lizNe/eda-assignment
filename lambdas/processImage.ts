import { SQSHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDB = new DynamoDB();

export const handler: SQSHandler = async (event) => {
  console.log("Received event: ", JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const recordBody = JSON.parse(record.body); // Parse SQS message
      console.log("Record body: ", JSON.stringify(recordBody));

      const snsMessage = JSON.parse(recordBody.Message); // Parse SNS message
      console.log("Parsed message: ", JSON.stringify(snsMessage));

      if (snsMessage.Records) {
        console.log("Message records: ", JSON.stringify(snsMessage.Records));
        for (const messageRecord of snsMessage.Records) {
          console.log("Processing message record: ", JSON.stringify(messageRecord));

          const s3e = messageRecord.s3;
          const srcKey = decodeURIComponent(
            s3e.object.key.replace(/\+/g, " ")
          );

          // Check file extension
          if (!srcKey.toLowerCase().endsWith(".jpeg") && !srcKey.toLowerCase().endsWith(".png")) {
            console.error("File does not have a '.jpeg' or '.png' extension. File: ", srcKey);
            throw new Error("File does not have a '.jpeg' or '.png' extension");
          }

          // Write item to DynamoDB table
          const params: DynamoDB.PutItemInput = {
            TableName: "Images", // Table name
            Item: {
              fileName: { S: srcKey }, // Primary key
            },
          };

          await dynamoDB.putItem(params).promise();
          console.log(`Image ${srcKey} saved to DynamoDB`);
        }
      }
    } catch (error) {
      console.error("Error processing record: ", error);
      // Continue processing other records even if one fails
    }
  }
};
