const { request } = require("undici");
const { getAuthHeaders } = require("./valr-auth");
const util = require("util");

let requestConfig;
const loggingEnabled = true;

async function setConfig(config) {
  requestConfig = config;
  console.log(`Current config: `, requestConfig);
}

async function call(verb, url, data) {
  if (!requestConfig) {
    console.log("========================");
    console.log("CONFIG NOT SET");
    console.log("USE http.setConfig()");
    console.log("========================");
    return null;
  }

  if (typeof data != "string") {
    data = JSON.stringify(data);
  }

  const headers = getAuthHeaders(
    requestConfig.apiKey,
    requestConfig.apiSecret,
    url,
    verb,
    data
  );

  headers.accept = "application/json";

  const fullUrl = requestConfig.baseUrl + url;

  console.log(`Outgoing ==> [${verb}]`, fullUrl);

  const { statusCode, body } = await request(requestConfig.baseUrl, {
    path: url,
    method: verb.toUpperCase(),
    body: data,
    headers: headers,
  });

  console.log(`Incoming <== [${statusCode}]`, fullUrl);

  if (statusCode < 300) {
    const result = await body.json();
    if (loggingEnabled) {
      console.log(util.inspect(result, false, null, true));
    }
    return await result;
  } else {
    const message = { statusCode, body: await body.text() };
    throw Error(JSON.stringify(message));
  }
}

module.exports = { call, setConfig };
