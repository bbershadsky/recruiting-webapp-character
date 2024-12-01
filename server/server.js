const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let characterData = {};

app.post('/api/:username/character', (req, res) => {
    const { username } = req.params;
    characterData[username] = req.body;
    console.log(`Data saved for ${username}:`, req.body);
    res.status(200).send({ message: 'Character saved successfully' });
});

app.get('/api/:username/character', (req, res) => {
    const { username } = req.params;
    const data = characterData[username] || {};
    console.log(`Data retrieved for ${username}:`, data);
    res.status(200).send(data);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
