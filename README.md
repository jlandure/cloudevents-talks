# Cloud Eventarc – Cloud Storage Events tutorial

fork from `https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/eventarc/audit-storage`

This sample shows how to create a service that processes GCS events.

For more details on how to work with this sample read the [Google Cloud Run Node.js Samples README](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/run).

## Dependencies

- **express**: Web server framework.
- **mocha**: [development] Test running framework.
- **supertest**: [development] HTTP assertion test client.

## Setup

Configure environment variables:

```sh
MY_RUN_SERVICE=gcs-service
MY_RUN_CONTAINER=gcs-container
MY_GCS_BUCKET=$(gcloud config get-value project)-gcs-bucket
```

## Démo jlandure + eric_briand

```
# default configuration
gcloud config set project cloudevents-talk
gcloud config set eventarc/location us-central1
gcloud services enable run.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# default IAM binding
export PROJECT_NUMBER="$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')"

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com"\
    --role='roles/iam.serviceAccountTokenCreator'
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member=serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
    --role='roles/eventarc.eventReceiver'
gcloud projects get-iam-policy $(gcloud config get-value project)

# bucket creation
gsutil mb -p $(gcloud config get-value project) -l us-central1 gs://cloudevents-talk-super-bucket

# clone the project source code
git clone

# build with Cloud Build
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/helloworld-events:3
# deploy on Cloud Run
gcloud run deploy helloworld-events \
    --image gcr.io/$(gcloud config get-value project)/helloworld-events:3 \
    --allow-unauthenticated
# create a trigger with EventArc
gcloud eventarc triggers create events-quickstart-trigger \
    --destination-run-service=helloworld-events \
    --destination-run-region=us-central1 \
    --event-filters="type=google.cloud.audit.log.v1.written" \
    --event-filters="serviceName=storage.googleapis.com" \
    --event-filters="methodName=storage.objects.create" \
    --service-account=${PROJECT_NUMBER}-compute@developer.gserviceaccount.com

# create a file and copy it on Cloud Storage
echo "yeah" > cloudevents.txt
gsutil cp cloudevents.txt gs://cloudevents-talk-super-bucket/cloudevents.txt

# check the logs to see the cloudevent
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=helloworld-events" --limit 15 | grep "✨ Detected"

# list all the triggers
gcloud eventarc triggers list
```

## Local test

```
npm start
# Demo for CloudEvents Up and Runnning 🚀
curl localhost:8080 -p -X POST -H "ce-subject:test"
# ✨ Detected change in Cloud Storage bucket: test
```

## Quickstart

Deploy your Cloud Run service:

```sh
gcloud builds submit \
  --tag gcr.io/$(gcloud config get-value project)/$MY_RUN_CONTAINER
gcloud run deploy $MY_RUN_SERVICE \
  --image gcr.io/$(gcloud config get-value project)/$MY_RUN_CONTAINER \
  --allow-unauthenticated
```

Create a _single region_ Cloud Storage bucket:

```sh
gsutil mb -p $(gcloud config get-value project) \
  -l us-central1 \
  gs://"$MY_GCS_BUCKET"
```

Create a Cloud Storage (via Audit Log) trigger:

```sh
gcloud beta eventarc triggers create my-gcs-trigger \
  --destination-run-service $MY_RUN_SERVICE  \
  --matching-criteria type=google.cloud.audit.log.v1.written \
  --matching-criteria methodName=storage.buckets.update \
  --matching-criteria serviceName=storage.googleapis.com \
  --matching-criteria resourceName=projects/_/buckets/"$MY_GCS_BUCKET"
```

## Test

Test your Cloud Run service by creating a GCS event:

```sh
gsutil defstorageclass set NEARLINE gs://"$MY_GCS_BUCKET"
```

Observe the Cloud Run service printing upon receiving an event in Cloud Logging:

```sh
gcloud logging read "resource.type=cloud_run_revision AND \
  resource.labels.service_name=$MY_RUN_SERVICE" --project \
  $(gcloud config get-value project) --limit 30 --format 'value(textPayload)'
```
