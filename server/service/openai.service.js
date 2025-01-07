const OpenAI = require('openai');
const { OPENAI_API_KEY } = process.env;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const generateDescriptionFromTitle = async (title) => {
    try {
        const response = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }],
            model: "gpt-3.5-turbo",
        });
        console.log(response.data,"pppp")
        const description = response.data.choices[0].text.trim();
        return description;
    }
    catch (error) {
        console.error('Error generating description:', error);
        return "";
    }
}

module.exports = {
    generateDescriptionFromTitle
}