let paymentResolver = null;

self.addEventListener("canmakepayment", (event) => {
  event.respondWith(true);
});

self.addEventListener("paymentrequest", async (event) => {
  // Create a promise that will be resolved when the client sends back card data
  const paymentPromise = new Promise((resolve, reject) => {
    paymentResolver = { resolve, reject };
  });

  event.respondWith(paymentPromise);

  // Open the payment page (your cardpay.html)
  const client = await event.openWindow("./navigate.html");
  if (!client) {
    paymentResolver.reject("Failed to open window");
    return;
  }

  const data = event.methodData[0].data;
  const urlToOpen = data?.url || "https://google.com";
  if (!urlToOpen.startsWith("http")) {
    paymentResolver.reject("Invalid URL");
    return;
  }

  // Send the target URL to the opened page
  client.postMessage({ url: urlToOpen });

  // Listen for card details from the client
  const messageHandler = (msg) => {
    if (msg.data && msg.data.cardDetails) {
      const { cardNumber, expiryMonth, expiryYear, cvv, cardholder } = msg.data.cardDetails;
      paymentResolver.resolve({
        methodName: event.methodData[0].supportedMethods,
        details: {
          cardNumber,
          expiryMonth,
          expiryYear,
          cardSecurityCode: cvv,
          cardholderName: cardholder
        }
      });
      self.removeEventListener('message', messageHandler);
    }
  };
  self.addEventListener('message', messageHandler);
});
