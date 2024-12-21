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

const chatSessions = new Map();

function createNewChat() {
    const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048  // Reduced to prevent overly long responses
        }
    });

    return model.startChat({
        history: [],
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048
        }
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/chat', async (req, res) => {
    const sessionId = req.headers['session-id'] || 'default';
    
    if (!chatSessions.has(sessionId)) {
        chatSessions.set(sessionId, createNewChat());
    }

    const chat = chatSessions.get(sessionId);
    
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 30000); // 30 second timeout

        const result = await Promise.race([
            chat.sendMessage(req.body.message),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Response timeout')), 30000)
            )
        ]);

        clearTimeout(timeout);
        
        const response = await result.response;
        res.json({ response: response.text() });

    } catch (error) {
        console.error('Error:', error);
        
        // Create new chat session if error occurs
        chatSessions.set(sessionId, createNewChat());
        
        res.status(500).json({ 
            error: 'Message processing error. Starting new chat session.',
            newSession: true
        });
    }
});

// Cleanup old sessions periodically
setInterval(() => {
    const now = Date.now();
    chatSessions.forEach((chat, id) => {
        if (chat.lastUsed && now - chat.lastUsed > 3600000) { // 1 hour
            chatSessions.delete(id);
        }
    });
}, 3600000); // Check every hour

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
