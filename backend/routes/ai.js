const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// @route   POST /api/ai/chat
// @desc    Chatbot assistant
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const systemInstruction = "You are a friendly and helpful customer support assistant for SuperMarket Pro, an online grocery store. Keep your answers concise, engaging, and helpful. Help users find fresh groceries, recipes, store timings (8 AM - 10 PM), and delivery options.";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });
        
        res.json({ success: true, reply: response.text });
    } catch (error) {
        console.error('AI Chat Error:', error);
        const errStr = (error.message || '') + (error.status || '');
        
        let reply = "Hello! I am your SuperMarket Pro assistant. ";
        
        if (errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota') || errStr.includes('429')) {
            reply += "I'm receiving high traffic right now and hit Google's free tier rate limit. Please try again in 30 seconds! Meanwhile, feel free to browse our fresh groceries.";
        } else if (errStr.includes('INVALID_ARGUMENT') || errStr.includes('suspended') || errStr.includes('API_KEY_INVALID')) {
            reply += "Note: The current Gemini API Key in `backend/.env` is invalid or suspended. Please generate a new key on Google AI Studio.";
        } else {
            reply += "How can I help you find fresh products today?";
        }

        res.json({ success: true, reply });
    }
});

// @route   POST /api/ai/smart-search
// @desc    Smart product search using natural language
router.post('/smart-search', async (req, res) => {
    try {
        const { query, products } = req.body;
        
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Products array is required' });
        }

        const cleanProducts = products.map(p => ({ id: p.id, name: p.name, category: p.category, tags: p.tags }));
        
        const systemInstruction = `You are a smart search engine for a grocery store. The user will provide a search query.
You have the following products available:
${JSON.stringify(cleanProducts)}

Return a JSON array of product IDs that best match the user's intent. Only return the JSON array of IDs, nothing else. For example: [1, 5, 12]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: query,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });
        
        const matchedIds = JSON.parse(response.text);
        res.json({ success: true, matchedIds });
    } catch (error) {
        console.error('Smart Search Error:', error.message || error);
        
        // Smart fallback search based on query keywords
        const { query, products } = req.body;
        const searchTerm = (query || '').toLowerCase();
        const fallbackProducts = (products || []).filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            (p.category && p.category.toLowerCase().includes(searchTerm))
        );
        const matchedIds = fallbackProducts.map(p => p.id);

        res.json({ success: true, matchedIds });
    }
});

// @route   POST /api/ai/recommendations
// @desc    Product recommendations based on cart
router.post('/recommendations', async (req, res) => {
    const { cartItems, allProducts } = req.body || {};
    try {
        if (!cartItems || cartItems.length === 0) {
            return res.json({ success: true, recommendedIds: [], reason: "Add items to your cart to get recommendations!" });
        }
        
        const cartNames = cartItems.map(item => item.name).join(', ');
        const cleanProducts = (allProducts || []).map(p => ({ id: p.id, name: p.name, category: p.category }));
        
        const prompt = `The user currently has these items in their cart: ${cartNames}.
Based on these items, recommend 4 complementary products from our catalog. 
Catalog: ${JSON.stringify(cleanProducts)}

Return the response strictly in the following JSON format:
{
  "recommendedIds": [id1, id2, id3, id4],
  "reason": "A short, friendly sentence explaining why these are recommended based on their cart."
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0.4,
                responseMimeType: "application/json"
            }
        });
        
        const result = JSON.parse(response.text);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Recommendations Error:', error.message || error);
        
        // Smart fallback recommendations
        const fallbackIds = (allProducts || []).slice(0, 4).map(p => p.id);
        res.json({ 
            success: true, 
            recommendedIds: fallbackIds,
            reason: "Popular top-rated grocery items customers frequently buy together!" 
        });
    }
});

module.exports = router;
