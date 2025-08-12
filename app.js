const apiKey = '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'; // Replace with your actual API key
const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const responseDiv = document.getElementById('response');
const conversationContext = "You are a human-like conversational AI agent. You will generate responses using information exclusively from the official websites of the FDA (Food and Drug Administration), CDC (Centers for Disease Control and Prevention), and NIH (National Institutes of Health).";
const conversationHistory = [];

sendButton.addEventListener('click', async () => {
    const userMessage = userInput.value;
    const fullMessage = `${conversationContext} ${userMessage}`;

    if (!userMessage) return;

    responseDiv.innerHTML = "Loading...";
    userInput.value = "";

    // Add user message to history
    conversationHistory.push({ role: 'user', content: fullMessage });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: fullMessage }]
            })
        });

        const data = await response.json();
        
        const botReply = data.choices[0].message.content;
        responseDiv.innerHTML = botReply;
       
        conversationHistory.push({ role: 'assistant', content: botReply });
        console.log("API raw response:", data);

    } catch (error) {
        console.error('Fetch error:', error);
        responseDiv.innerHTML = "Error occurred while fetching response.";
    }
});
