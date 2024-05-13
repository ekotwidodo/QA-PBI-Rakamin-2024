import http from "k6/http";
import { group, check, sleep } from "k6";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

/**
 * //----------------------------------------------------------------
 * CONSTANTS
 * //----------------------------------------------------------------
 **/

// Base URL
const BASE_URL = "https://reqres.in";
// Headers
const HEADERS = {
  headers: {
    "Content-Type": "application/json",
  },
};
// Payloads
const PAYLOADS = {
  create: {
    name: "morpheus",
    job: "leader",
  },
  update: {
    name: "morpheus",
    job: "zion resident",
  },
};

// Constants for performance test
const OPTIONS_VUS = 1000, // 1000 virtual users
  OPTIONS_ITERATIONS = 3500, // running in 3500 iterations
  OPTIONS_HTTP_REQ_DURATION = ["p(95)<2000"]; // 95% of requests should be below 2 seconds

export const options = {
  vus: OPTIONS_VUS,
  iterations: OPTIONS_ITERATIONS,
  thresholds: {
    http_req_duration: OPTIONS_HTTP_REQ_DURATION,
  },
};

/**
 * //----------------------------------------------------------------
 * INTEGRATION TEST
 * //----------------------------------------------------------------
 **/

export default function () {
  let API_URL = `${BASE_URL}/api/users`;
  // Initial post Id
  let POST_ID = 2;

  // API Create a new post
  group("01. Regres.in API Create", function () {
    const responseCreated = http.post(
      API_URL,
      JSON.stringify(PAYLOADS.create),
      HEADERS
    );

    // If the response is created, update post id to run the update API
    if (responseCreated) {
      POST_ID = responseCreated.json().id;
    }

    // List of items that should be checked
    let checkOptions = {
      "response status code should be 201 (CREATED)": (res) =>
        res.status === 201,
      "response body should not be empty": (res) =>
        res.body && res.body.length > 0,
      "response body should contain keys: id, name, job, and createdAt": (
        res
      ) => {
        return (
          res.json().hasOwnProperty("id") &&
          res.json().hasOwnProperty("name") &&
          res.json().hasOwnProperty("job") &&
          res.json().hasOwnProperty("createdAt")
        );
      },
      "name value in response should be equal to name value in request": (
        res
      ) => {
        return (
          res.json().hasOwnProperty("name") &&
          res.json().name === PAYLOADS.create.name
        );
      },
      "job value in response should be equal to job value in request": (
        res
      ) => {
        return (
          res.json().hasOwnProperty("job") &&
          res.json().job === PAYLOADS.create.job
        );
      },
    };

    // Run the checks with check options
    let checkResults = check(responseCreated, checkOptions);
    console.log(
      JSON.stringify(`Checks API Create Validation: ${checkResults}`, null, 2)
    );

    sleep(3);
  });

  // API Update a post
  group("2. Regres.in API Update", function () {
    const responseUpdated = http.put(
      `${API_URL}/${POST_ID}`,
      JSON.stringify(PAYLOADS.update),
      HEADERS
    );

    // List of items that should be checked
    let checkOptions = {
      "response status code should be 200 (OK)": (res) => res.status === 200,
      "response body should not be empty": (res) =>
        res.body && res.body.length > 0,
      "response body should contain keys: name, job, and updatedAt": (res) => {
        return (
          res.json().hasOwnProperty("name") &&
          res.json().hasOwnProperty("job") &&
          res.json().hasOwnProperty("updatedAt")
        );
      },
      "name value in response should be equal to name value in request": (
        res
      ) => {
        return (
          res.json().hasOwnProperty("name") &&
          res.json().name === PAYLOADS.update.name
        );
      },
      "job value in response should be equal to job value in request": (
        res
      ) => {
        return (
          res.json().hasOwnProperty("job") &&
          res.json().job === PAYLOADS.update.job
        );
      },
    };

    // Run the checks with check options
    let checkResults = check(responseUpdated, checkOptions);
    console.log(
      JSON.stringify(`Checks API Update Validation: ${checkResults}`, null, 2)
    );

    sleep(3);
  });
}

// Summary the performance test into html and json file
export function handleSummary(data) {
  let timeStamps = Math.floor(new Date().getTime() / 1000);
  return {
    [`performance_test_result-${timeStamps}.html`]: htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    [`performance_test_result-${timeStamps}.json`]: JSON.stringify(
      data,
      null,
      2
    ),
  };
}
