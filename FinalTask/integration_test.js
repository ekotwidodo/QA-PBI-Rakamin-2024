import http from "k6/http";
import { group, check, sleep } from "k6";

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
