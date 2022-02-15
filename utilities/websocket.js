const WebSocket = require("ws");
const { getAuthHeaders } = require("./valr-auth");

function connectToWs(config, wsName, callback) {
  const headers = getAuthHeaders(
    config.apiKey,
    config.apiSecret,
    `/ws/${wsName}`,
    "GET",
    ""
  );
  const wsUrl = `${config.wsUrl}/ws/${wsName}`;
  const ws = new WebSocket(wsUrl, { headers });

  ws.on("open", () => {
    let currentInterval;
    handleKeepAlive(ws, currentInterval);
    callback.open(wsName);
  });
  ws.on("error", (err) => {
    callback.error(wsName, err);
  });
  ws.on("message", (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.type === "PONG") {
      return;
    }
    callback.message(wsName, parsedData);
  });
  ws.on("close", (code, reason) => {
    callback.close(wsName, code, reason);
  });
}

function handleKeepAlive(ws, currentInterval) {
  if (currentInterval) {
    clearInterval(currentInterval);
  }

  currentInterval = setInterval(() => {
    const ping = {
      type: "PING",
    };
    ws.send(JSON.stringify(ping));
  }, 5000);
}

module.exports = { connectToWs };
