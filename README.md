# 💳 React + PayHere Integration using Vite + React

This guide will help you integrate the **PayHere** payment gateway with a React frontend built using **Vite**. You'll use crypto-js to generate a secure hash required by PayHere.

---

## 🚀 Getting Started

## Step 1: Create the React App

Open your terminal and run:


```bash
npm create vite@latest
# Choose a name (e.g., payhere-app)
# Framework: React
# Variant: JavaScript

#Then move into your project folder:
cd payhere-app

#Install the necessary dependencies:
npm install crypto-js
```

### 🧩 Add PayHere Payment Component 
## Step 2: Create a new file src/PayHereCheckout.jsx
#Add the following code:

```bash
import React, { useEffect } from 'react';
import md5 from 'crypto-js/md5';

const PayHereCheckout = () => {
    const merchantId = '***';             // Replace with actual merchant ID goto  https://sandbox.payhere.lk/merchant/sign-up
    const merchantSecret = '*******************************';     // Replace with actual secret
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
            notify_url: 'http://localhost:3001/payhere-notify', // Optional (for backend confirmation)

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

```

# 🧑‍💻 Update the Main App File
##Step 3: Modify src/App.jsx to use the checkout component
#Replace your existing App.jsx code with:
```bash
import './App.css'
import PayHereCheckout from './PayHereCheckout.jsx';

function App() {

  return (
    <>
      <div>
        <a href="https://www.payhere.lk" target="_blank">
          <img  src="https://www.payhere.lk/downloads/images/payhere_square_banner_dark.png" className="logo" alt="Vite logo"  style={{ width: '250px' }} />
        </a>

        <div className="App">
            <h1>React + PayHere Integration</h1>
            <PayHereCheckout />
        </div>
      </div>
    </>
  )
}
export default App
```
# Run the project
```bash
 npm run dev
```

# 💳 PayHere Backend Integration with React

This project sets up a simple **Node.js backend** using **Express** and **MySQL** to handle PayHere payment notifications. It also includes a **React frontend** that communicates with the backend.

---

## 📦 Backend Setup

### 📁 Create & Initialize Project

```bash
mkdir payhere-backend
cd payhere-backend
npm init -y
```
## Install Dependencies
```bash
npm install express body-parser mysql cors
```

# modify the server.js file 
```bash
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3001;

// PayHere Merchant Secret
const MERCHANT_SECRET = 'MjM5MzQ1MDgyNDQwNTM3NDUwMjUzNTI5NDI4ODczNDkxNzI3ODcw';



// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL DB Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'xyz', // ✅ Use your database name
});

db.connect((err) => {
    if (err) {
        console.error('DB connection error:', err);
    } else {
        console.log('✅ Connected to MySQL');
    }
});

// PayHere Notify URL Endpoint
app.post('/payhere-notify', (req, res) => {
    const data = req.body;
    console.log('📩 Received PayHere notification:', data);
    const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
        method,
        customer_name,
        customer_email,
        custom_1
    } = data;

    // Step 1: Generate hash
    const hashedSecret = crypto
        .createHash('md5')
        .update(MERCHANT_SECRET)
        .digest('hex')
        .toUpperCase();

    const localSig = crypto
        .createHash('md5')
        .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
        .digest('hex')
        .toUpperCase();

    // Step 2: Compare Signature
    if (md5sig !== localSig) {
        console.error('❌ Invalid signature!');
        return res.status(400).send('Invalid signature');
    }

    // Step 3: Store Payment in DB
    const sql = `
    INSERT INTO payments (
      order_id, amount, currency, status_code,
      method, customer_name, customer_email, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

    const values = [
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        method,
        customer_name,
        customer_email
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('DB Insert Error:', err);
        } else {
            console.log('✅ Payment saved to DB:', result.insertId);
        }
    });

    res.send('OK');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

```
# Run the project 

```bash
npm start
```
