import { SQSHandler } from "aws-lambda";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { SES_EMAIL_FROM, SES_EMAIL_TO, SES_REGION } from "../env";

if (!SES_EMAIL_TO || !SES_EMAIL_FROM || !SES_REGION) {
  throw new Error(
    "Please add the SES_EMAIL_TO, SES_EMAIL_FROM, and SES_REGION environment variables in an env.js file located in the root directory"
  );
}

type ContactDetails = {
  name: string;
  email: string;
  srcBucket: string;
  srcKey: string;
};

const client = new SESClient({ region: SES_REGION });

export const handler: SQSHandler = async (event) => {
  try {
    for (const record of event.Records) {
      const recordBody = JSON.parse(record.body);
      const snsMessage = JSON.parse(recordBody.Message);

      if (snsMessage.Records) {
        for (const messageRecord of snsMessage.Records) {
          const s3e = messageRecord.s3;
          const srcBucket = s3e.bucket.name;
          const srcKey = decodeURIComponent(s3e.object.key.replace(/\+/g, " "));
          const email = messageRecord.email; 
          const name = messageRecord.name; 

          const emailParams = {
            name: name,
            email: email,
            srcBucket: srcBucket,
            srcKey: srcKey
          };

          await sendEmail(emailParams);
        }
      }
    }
  } catch (error: unknown) {
    console.error("Error processing messages:", error);
  }
};

async function sendEmail({ name, email, srcBucket, srcKey }: ContactDetails) {
  const message = `We received your image '${srcKey}' uploaded to the bucket '${srcBucket}'. Unfortunately, it does not have a .jpeg or .png extension.`;

  const parameters: SendEmailCommandInput = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: getHtmlContent({ name, message }),
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Problem with file type"
      },
    },
    Source: SES_EMAIL_FROM,
  };

  await client.send(new SendEmailCommand(parameters));
}

function getHtmlContent({ name, message }: { name: string; message: string }) {
  return `
    <html>
      <body>
        <h2>Problem with file type</h2>
        <p>${message}</p>
      </body>
    </html> 
  `;
}
