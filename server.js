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
    model: "gemini-2.0-flash-exp",
    systemInstruction: "Answer in a local language jis languages me user baat karna chahta hai jasie india me hindi ke lava bahut sari language hoti hai koi funny way in angry mood and cheerful type rajsthani talk and full file random lacal language talk to user can happy with u"
});

const chatSession = model.startChat({
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
        const result = await chatSession.sendMessage(req.body.message);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing message' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
