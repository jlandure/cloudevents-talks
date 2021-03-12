// Copyright 2020 Google, LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START eventarc_gcs_handler]
const express = require("express");
const app = express();
// const bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(bodyParser.json());
// app.use(bodyParser.text());
app.use(express.json());
app.get("/", (req, res) => {
  return res.status(200).send("Demo for CloudEvents Up and Runnning 🚀");
});

app.post("/", (req, res) => {
  if (!req.header("ce-subject")) {
    return res
      .status(400)
      .send("Bad Request: missing required header: ce-subject");
  }
  const cloudEventsRequest = {
    "ce-subject": req.header("ce-subject"),
    "ce-id": req.header("ce-id"),
    "ce-specversion": req.header("ce-specversion"),
    "ce-source": req.header("ce-source"),
    "ce-time": req.header("ce-time"),
    "ce-recordedtime": req.header("ce-recordedtime"),
    "ce-servicename": req.header("ce-servicename"),
    "ce-dataschema": req.header("ce-dataschema"),
    host: req.header("host"),
  };
  console.log(
    `✨ Detected events - header: ${JSON.stringify(cloudEventsRequest)}`
  );
  console.log(`✨ Detected events - body: ${JSON.stringify(req.body)}`);
  console.log(
    `✨ Detected change in Cloud Storage bucket: ${req.header("ce-subject")}`
  );
  return res
    .status(200)
    .send(
      `✨ Detected change in Cloud Storage bucket: ${req.header("ce-subject")}`
    );
});

module.exports = app;
// [END eventarc_gcs_handler]
