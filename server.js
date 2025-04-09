const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


app.use(express.static('public'));
app.use('/src', express.static('src'));


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});