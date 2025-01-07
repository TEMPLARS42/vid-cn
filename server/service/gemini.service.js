const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateDescriptionFromTitle = async (title) => {
    try {
        // Update the prompt to dynamically include the video title
        const prompt = `Generate a detailed and engaging description for a video with the title: "${title}" in short and descriptive with no options just the title please`;

        // Assuming `model.generateContent` is your AI model function
        const result = await model.generateContent(prompt);

        // Assuming the result has a response structure with text or response in result.response.text()
        const description = result.response.text();  // Ensure async handling if necessary

        // Return the generated description
        return description.trim();
    } catch (error) {
        console.error('Error generating description:', error);
        return "";
    }
}


module.exports = {
    generateDescriptionFromTitle
}