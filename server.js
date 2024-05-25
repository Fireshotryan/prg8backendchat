import express from 'express';
import cors from 'cors';
import { ChatOpenAI } from "@langchain/openai";
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import PromptTemplate from './prompttemplate.js';

// Define constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Initialize the ChatOpenAI model
const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

// Create an instance of the PromptTemplate class
const promptTemplate = new PromptTemplate();

// Enable CORS
app.use(cors());

app.use(express.json());
app.use(express.static(__dirname));

app.post('/motivate', async (req, res) => {
    try {
        const { prompt } = req.body;

        // Refine the prompt using the PromptTemplate class
        const engineeredPrompt = promptTemplate.refinePrompt(prompt);

        console.log('Engineered Prompt:', engineeredPrompt);

        // Check if the prompt is gibberish using the PromptTemplate class
        if (promptTemplate.isGibberish(prompt) || promptTemplate.isGibberish(engineeredPrompt)) {
            return res.status(400).json({ error: 'Gibberish or non-understandable input.' });
        }

        // Add motivational context to the prompt to bias the AI towards motivational responses
        const motivationalContext = ' motivational'; // Add more specific context if needed
        const biasedPrompt = `${engineeredPrompt}${motivationalContext}`;

        // Fetch a relevant quote from thedogapi based on the input prompt
        const dogImages = await fetchDogImages(prompt);
        console.log('Dog images from the API:', dogImages);

        // Let's compose a message combining AI response and dog images
        let composedMessage = biasedPrompt; // Start with the biased prompt
        if (dogImages.length > 0) {
            // Add a fun message when dog images are available
            composedMessage += "\n\nHere's a happy dog to cheer you up!";
        }

        // Send the composed message to the OpenAI model to get a response
        const response = await model.invoke(composedMessage);
        console.log('Response from AI:', response);
        const aiMessage = response.content;

        // Construct the latest response object
        const latestResponse = { content: aiMessage }; // Adjust as needed

        // Send the AI message, the dog images, and the latest response back to the client
        res.json({ aiMessage: aiMessage, dogImages: dogImages, latestResponse: latestResponse });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Function to fetch dog images from thedogapi
async function fetchDogImages(prompt) {
    try {
        const response = await fetch(`https://api.thedogapi.com/v1/images/search?q=${prompt}`, {
            headers: {
                'x-api-key': process.env.API_KEY // Use your API key here
            }
        });
        const data = await response.json();
        return data.map(image => image.url);
    } catch (error) {
        console.error('Error fetching dog images:', error);
        return [];
    }
}

app.get('/', (req, res) => {
    res.redirect('https://front-end-chat.onrender.com/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
