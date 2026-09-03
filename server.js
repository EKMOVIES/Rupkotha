// server.js

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// স্ট্যাটিক ফাইল সার্ভ করুন
app.use(express.static(path.join(__dirname)));

// সব রিকোয়েস্ট index.html-এ পাঠান (SPA সাপোর্ট)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});