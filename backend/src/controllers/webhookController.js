const supabase = require('../config/supabase');

exports.handleSmsFunctions = async (req, res) => {
    try {
        const event = req.body;
        
        console.log('Incoming SMS Webhook:', JSON.stringify(event, null, 2));

        if (event.data && event.data.event_type === 'message.received') {
            const { payload } = event.data;
            const fromNumber = payload.from.phone_number;
            const toNumber = payload.to[0].phone_number;
            const text = payload.text;
            
            // Log to database (optional, but good practice if Supabase table exists)
            // Ideally we find the contact and the agent associated with these numbers
            console.log(`Received SMS from ${fromNumber} to ${toNumber}: ${text}`);
            
            // TODO: Implement logic to store message in conversation history
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing SMS webhook:', error);
        res.status(500).send('Error');
    }
};

exports.handleVoiceFunctions = async (req, res) => {
    try {
        const event = req.body;
        console.log('Incoming Voice Webhook:', JSON.stringify(event, null, 2));

        if (event.data && event.data.event_type === 'call.initiated') {
            const { payload } = event.data;
            console.log(`Call initiated from ${payload.from} to ${payload.to} (Call ID: ${payload.call_control_id})`);
            
            // Basic answer command if using Call Control
            // This requires the response to be a JSON command or using the API to answer
            // For simple webhooks, we usually just log or update status
        }
        
        // Respond with 200 OK to acknowledge receipt
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing Voice webhook:', error);
        res.status(500).send('Error');
    }
};
