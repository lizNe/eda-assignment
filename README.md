## EDA Assignment - Distributed Systems.

__Name:__ Elizabeth Neary

__YouTube Demo link__ - https://vimeo.com/943047234?share=copy


### Phase 1.

During the First Phase of the Architecture Diagram , In the eda-app-stack I was able to implement the DynamoDB Table for Images and processed to create a new folder '/shared' containg my types.d.ts that contains the schema for my images table . This table only contains one attribute which is 'filename'. In the eda-app-stack I was also able to subscribe the Confirmation Mailer (mailer.ts) directly to the SNS Topic and subscribe the SQS Queue called 'ImageProcessQueue'. I created a new lambda 'rejectionMailer.ts' containg similar code to mailer only with the email giving back a message that upload was unsuccessful. In the eda-app-stack I implemented the logic for the DLQ and added the rejectionMailer.ts to it as an event source. I was able to remove the automatic download of the image from Process Image (processImage.ts) Lambda function. However I was unable to successfully implement the logic for executing the DLQ to trigger the Rejection Mailer and i was unable to successfully add the image to the database in DynamoDB. When attempting to upload an image that was not of format jpeg or png , it would still confir =m successful upload and the DLQ would not trigger and Rejection Mailer not triggering either.

+ Confirmation Mailer - Fully implemented. I was able to subscribe the Confimartion Mailer (mailer.ts) Lambda function to the SNS topic directly without the need for a queue as by the architecture diagram.

+ Rejection Mailer - Fully implemented. A Rejection Mailer (rejectionMailer.ts) was created containing code that would send an email to the user illustrating that the image upload was unsuccessful due to the uploaded image containing incorrect format (not jpeg or png)

+ Process Image - Not working. I implemented code in my Process Image (processImage.ts) Lambda function that would upload an image to an S3 bucket and would throw an error when the uploaded image is not jpeg or png format. However, after attempting uploading an image with a different format , the image was still uploaded with no error thrown. Implemented code for adding the uploaded image to the Images database but was unable to get that implemented successfully. I was unable to get the DLQ to trigger once the error was thrown that would trigger the DLQ and execute the Rejection Mailer. 




