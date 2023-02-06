const AWS = require('ibm-cos-sdk')
//const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env

var config = {
	endpoint: 's3.us-south.cloud-object-storage.appdomain.cloud',
	apiKeyId: 'RIblWRFHdnOlBeJpdwVFBh0LTltoNHIVcbwLkFs60XuD',
	serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/e1088f762da34a8c97ec402e732b5b60:3bf39259-ef2b-4b16-9261-193d59371b90::',
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