const signer = require("./signer");

function getAuthHeaders(apiKey, apiSecret, path, method, body) {
  const headers = new Object();
  const timestamp = new Date().getTime();
  const signature = signer.signRequest(
    apiSecret,
    timestamp,
    method,
    path,
    body,
    ""
  );

  headers["X-VALR-API-KEY"] = apiKey;
  headers["X-VALR-SIGNATURE"] = signature;
  headers["X-VALR-TIMESTAMP"] = timestamp;

  return headers;
}

module.exports = { getAuthHeaders };
