const crypto = require("crypto");

/**
 *
 * @param {*} apiKeySecret - the api key secret
 * @param {*} expiresAt - the unix timestamp when this request expires
 * @param {*} verb - Http verb - GET, POST, PUT or DELETE
 * @param {*} path - path excluding host name, e.g. '/api/v1/withdraw
 * @param {*} body - http request body as a string, optional
 */

function signRequest(
  apiKeySecret,
  expiresAt,
  verb,
  path,
  body = "",
  subAccountId = ""
) {
  const hash = crypto
    .createHmac("sha512", apiKeySecret)
    .update(expiresAt.toString())
    .update(verb.toUpperCase())
    .update(path)
    .update(body)
    .update(subAccountId)
    .digest("hex");
  return hash;
}

/**
 *
 * @param {*} apiKeySecret - the api key secret
 * @param {*} signature - the signature to verify against
 * @param {*} expiresAt - the unix timestamp when this request expires
 * @param {*} verb - Http verb - GET, POST, PUT or DELETE
 * @param {*} path - path excluding host name, e.g. '/api/v1/withdraw
 * @param {*} body - http request body as a string, optional
 */
function verifySignature(
  apiKeySecret,
  signature,
  expiresAt,
  verb,
  path,
  body = ""
) {
  var calculatedSignature = signRequest(
    apiKeySecret,
    expiresAt,
    verb,
    path,
    body
  );
  return calculatedSignature == signature;
}

/**
 * Derives a child api secret from a masterKey and apiKey
 *
 * @param {*} masterSecret
 * @param {*} apiKey
 * @param {*} salt
 */
function deriveApiSecret(masterSecret, apiKey, salt) {
  return crypto
    .createHmac("sha512", masterSecret)
    .update(salt)
    .update(apiKey)
    .digest("hex")
    .slice(0, 64);
}

module.exports = {
  signRequest,
  verifySignature,
  deriveApiSecret,
};
