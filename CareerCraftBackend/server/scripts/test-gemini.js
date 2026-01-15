import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
    try {
        console.log('Fetching available models...\n');
        
        // Try to list models using fetch directly
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Available models:');
        data.models?.forEach(model => {
            if (model.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`✓ ${model.name}`);
            }
        });
        
        // Try the first available model
        if (data.models && data.models.length > 0) {
            const firstModel = data.models.find(m => 
                m.supportedGenerationMethods?.includes('generateContent')
            );
            
            if (firstModel) {
                // Use Flash model for lower quota usage
                const modelName = 'gemini-2.0-flash-lite';
                console.log(`\nTesting with: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say hello');
                const response = await result.response;
                console.log('✓ SUCCESS!');
                console.log('Response:', response.text());
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.log('\n🔍 Debugging info:');
        console.log('- API Key exists:', !!process.env.GEMINI_API_KEY);
        console.log('- Key preview:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');
        console.log('\n💡 Try:');
        console.log('1. Check API key restrictions in Google AI Studio');
        console.log('2. Make sure "Generative Language API" is enabled');
        console.log('3. Wait a few minutes if key was just created');
    }
}

listAvailableModels();