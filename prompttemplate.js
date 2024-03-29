export default class PromptTemplate {
    constructor() {
        // You can initialize any properties or setup here
    }

    refinePrompt(prompt) {
        // Add context or constraints to the prompt
        // You can customize this function based on your specific requirements
        return `Give me a motivational quote about ${prompt}`;
    }

    isGibberish(prompt) {
        // Define your criteria for determining gibberish here
        // You may need to adjust these conditions based on your specific requirements

        // Check if the prompt contains only non-alphabetic characters
        if (!/[a-zA-Z]/.test(prompt)) {
            return true; // Return true if the prompt contains no alphabetic characters
        }

        // Check if the prompt consists of repeating characters or patterns
        if (/([a-zA-Z])\1{2,}/.test(prompt)) {
            return true; // Return true if the prompt contains repeating characters (e.g., 'aaa', '111', etc.)
        }

        // Check if the prompt is very short (e.g., less than 4 characters)
        if (prompt.length <= 3) {
            return true; // Return true if the prompt is very short
        }

        // Add more conditions as needed to identify gibberish prompts

        // If none of the above conditions are met, return false (not gibberish)
        return false;
    }
}
