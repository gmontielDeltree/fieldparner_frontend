const AWS = require('ibm-cos-sdk')
//const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env
//https://stackoverflow.com/questions/51632767/how-do-i-create-hmac-credentials-for-ibm-cloud-object-storage-using-the-cli
//https://stackoverflow.com/questions/52100144/how-do-i-generate-presigned-links-with-the-nodejs-sdk-for-ibm-cloud-object-stora
// La service credential tiene que tener HMAC habilitado 
// ibmcloud resource service-key-create cos-hmac-cli Writer --instance-name fieldpartner-cos-trigger-cos --parameters '{"HMAC":true}'

var config = {
	endpoint: 's3.us-south.cloud-object-storage.appdomain.cloud',
	apiKeyId: '8BaLGiQKfQPdTRQ5F90AFU66nm6ofjvqu0pg1D3eDMB7',
	serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/e1088f762da34a8c97ec402e732b5b60:3bf39259-ef2b-4b16-9261-193d59371b90::',
    credentials: new AWS.Credentials('488075d841d34ceaabdb30d0e6cf5727', '981d88f49c740c9c517dd4b305c2543b24d07681b844b15a', sessionToken = null),
};

const s3 = new AWS.S3(
	config
)

module.exports.handler = async (event, context) => {
  const body = JSON.parse(event.body)
  const { fileName, fileType } = body

  if (!fileName && !fileType) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing fileName or fileType on body'
      }),
    }
  }

  const s3Params = {
    Bucket: "adjuntos-fieldpartner",
    Key: fileName,
    ContentType: fileType,
    ACL: 'public-read', /* Note: change if files are NOT public */
    /* Optionally add additional data
    Metadata: {
      foo: 'bar',
      lol: 'hi'
    }
    */
  }

  const uploadURL = s3.getSignedUrl('putObject', s3Params)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadURL: uploadURL
    }),
  }
}