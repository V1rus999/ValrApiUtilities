const config = require("./config");
const { connectToWs } = require("./utilities/websocket");
const { orders, setConfig } = require("./utilities/valr-api");

let receives = {};

async function main() {
  l("Starting");
  setConfig(config);
  connectToWs(config, "account", wsCallback);
}

const wsCallback = {
  open: (wsName) => {
    l(wsName + " OPEN");
  },
  error: (wsName, err) => {
    l(wsName + " error", err);
  },
  message: (wsName, data) => {
    l(wsName + " message", data.type);
    handleMessage(data);
  },
  close: (wsName, code, reason) => {
    l(wsName + " close", code, reason);
  },
};

function handleMessage(data) {
  if (data.type === "NEW_ACCOUNT_HISTORY_RECORD") {
    handleAccountHistoryUpdate(data.data);
  } else if (data.type === "INSTANT_ORDER_COMPLETED") {
    l(data);
  }
}

function handleAccountHistoryUpdate(pendingReceiveData) {
  const txType = pendingReceiveData.transactionType;
  if (
    txType.type === "BLOCKCHAIN_RECEIVE" &&
    txType.description === "Receive"
  ) {
    //Place market order
    const receiveDetails = {
      id: pendingReceiveData.id,
      symbol: pendingReceiveData.creditCurrency.symbol,
      amount: pendingReceiveData.creditValue,
      date: pendingReceiveData.eventAt,
      orderPlaced: false,
    };

    receives[receiveDetails.id + receiveDetails.symbol] = receiveDetails;

    const orderDetails = {
      side: "SELL",
      payAmount: receiveDetails.amount,
      payInCurrency: `${receiveDetails.symbol}`,
    };

    l(orderDetails, "ORDER DETAILS");

    orders
      .placeSimpleOrder(orderDetails, `${receiveDetails.symbol}ZAR`)
      .then((val) => l(val, "SELL RESULT"))
      .catch((err) => {
        l(err, "SELL ERROR");
      });
  }
}

function l(m, o = "") {
  console.log(m, o);
}

main();
