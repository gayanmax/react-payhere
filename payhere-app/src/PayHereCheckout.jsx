import React, { useEffect } from 'react';
import md5 from 'crypto-js/md5';

const PayHereCheckout = () => {
    const merchantId = '1227856';             // Replace with actual merchant ID
    const merchantSecret = 'MjM5MzQ1MDgyNDQwNTM3NDUwMjUzNTI5NDI4ODczNDkxNzI3ODcw';     // Replace with actual secret
    const orderId = 'ORDER_12345';                     // Unique order ID
    const amount = 1000.00;                            // Amount in LKR
    const currency = 'LKR';

    // Format amount like "1000.00"
    const amountFormatted = parseFloat(amount)
        .toLocaleString('en-US', { minimumFractionDigits: 2 })
        .replaceAll(',', '');

    // Create hash (optional, only needed for server-to-server or advanced PayHere APIs)
    const hashedSecret = md5(merchantSecret).toString().toUpperCase();
    const hash = md5(merchantId + orderId + amountFormatted + currency + hashedSecret)
        .toString()
        .toUpperCase();

    // Load PayHere SDK once
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        script.async = true;
        script.onload = () => {
            console.log('PayHere SDK loaded');
        };
        document.body.appendChild(script);
    }, []);

    const handlePayNow = () => {
        // Optional event callbacks
        window.payhere.onCompleted = function (orderId) {
            alert("Payment completed. Order ID: " + orderId);
        };

        window.payhere.onDismissed = function () {
            alert("Payment dismissed by user.");
        };

        window.payhere.onError = function (error) {
            alert("Error occurred: " + error);
        };

        // Define payment object
        const payment = {
            sandbox: true, // Change to false for live environment
            merchant_id: merchantId,
            return_url: undefined, // optional
            cancel_url: undefined, // optional
            notify_url: 'https://d803-123-231-127-39.ngrok-free.app/payhere-notify', // Optional (for backend confirmation)

            order_id: orderId,
            items: 'Demo Product',
            amount: amountFormatted,
            currency: currency,
            hash: hash, // Only required for server-to-server / subscriptions
            first_name: 'Asanga',
            last_name: 'Perera',
            email: 'asanga@example.com',
            phone: '0771234567',
            address: '123, Galle Road',
            city: 'Colombo',
            country: 'Sri Lanka',
        };

        // Trigger payment popup
        window.payhere.startPayment(payment);
    };

    return (
        <div>
            <h2>PayHere Checkout</h2>
            <button onClick={handlePayNow}>Pay Now</button>
        </div>
    );
};

export default PayHereCheckout;
