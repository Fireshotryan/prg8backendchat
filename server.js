import express from 'express';
import cors from 'cors';
import { ChatOpenAI } from "@langchain/openai";
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import PromptTemplate from './prompttemplate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://front-end-chat.onrender.com', // Allow requests from your front-end URL
  methods: ['GET', 'POST'],
  credentials: true
}));

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

const promptTemplate = new PromptTemplate();

app.use(express.json());
app.use(express.static(path.resolve(__dirname)));

app.post('/motivate', async (req, res) => {
    try {
        const { prompt } = req.body;

        const engineeredPrompt = promptTemplate.refinePrompt(prompt);

        if (promptTemplate.isGibberish(prompt) || promptTemplate.isGibberish(engineeredPrompt)) {
            return res.status(400).json({ error: 'Gibberish or non-understandable input.' });
        }

        const motivationalContext = ' motivational';
        const biasedPrompt = `${engineeredPrompt}${motivationalContext}`;

        const response = await model.invoke(biasedPrompt);
        const aiMessage = response.content;

        const quote = await fetchZenQuote(prompt);

        const message = `${aiMessage}\n\n"${quote}"`;

        // Send the message back to the client
        res.json({ message }); // This line sends the message back to the client
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function fetchZenQuote() {
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        const data = await response.json();
        return data[0].q;
    } catch (error) {
        console.error('Error fetching quote from ZenQuotes API:', error);
        return '';
    }
}

app.get('*', (req, res) => {
    res.redirect('https://front-end-chat.onrender.com/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
