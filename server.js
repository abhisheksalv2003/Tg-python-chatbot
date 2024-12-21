const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-pro",  // Changed from gemini-2.0-flash-exp to gemini-pro
    generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192
    }
});

const chat = model.startChat({
    history: [],
    generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/chat', async (req, res) => {
    try {
        const result = await chat.sendMessage(req.body.message);
        const response = await result.response;
        res.json({ response: response.text() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing message' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
