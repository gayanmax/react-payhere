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
    database: 'payhere', // ✅ Use your database name
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
        status_message,
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
    // if (md5sig !== localSig) {
    //     console.error('❌ Invalid signature!');
    //     return res.status(400).send('Invalid signature');
    // }

    // Step 3: Store Payment in DB
    const sql = `
    INSERT INTO payments (
      order_id, payhere_amount, payhere_currency, status_code,
      method, status_message, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())`;

    const values = [
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        method,
        status_message,
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
