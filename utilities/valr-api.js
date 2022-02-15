const { call, setConfig } = require("./http");

const orders = {
  placeMarketOrder: async (data) => {
    return await call("POST", "/v1/orders/market", data);
  },
  placeSimpleOrder: async (data, currencyPair) => {
    return await call("POST", `/v1/simple/${currencyPair}/order`, data);
  },
};

module.exports = { orders, setConfig };
