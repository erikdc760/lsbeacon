const telnyx = require('telnyx');
const telnyxClient = telnyx(process.env.TELNYX_API_KEY);

const searchAvailableNumbers = async (areaCode, limit = 10) => {
    try {
        console.log(`Searching numbers for area code: ${areaCode}`);
        const { data } = await telnyxClient.availablePhoneNumbers.list({
            filter: {
                area_code: areaCode,
                country_code: 'US',
                limit: limit,
                features: ['sms', 'voice']
            }
        });
        return data;
    } catch (error) {
        console.error('Telnyx search error:', error);
        throw error;
    }
};

const purchaseNumber = async (phoneNumber) => {
    try {
        const { data } = await telnyxClient.numberOrders.create({
            phone_numbers: [{ phone_number: phoneNumber }]
        });
        return data;
    } catch (error) {
        console.error('Telnyx purchase error:', error);
        throw error;
    }
};

const assignNumberToConnection = async (phoneNumberId, connectionId) => {
    try {
        const { data } = await telnyxClient.phoneNumbers.update(phoneNumberId, {
            connection_id: connectionId,
            messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID
        });
        return data;
    } catch (error) {
        console.error('Telnyx assignment error:', error);
        throw error;
    }
};

const sendSms = async (from, to, text) => {
    try {
        const { data } = await telnyxClient.messages.create({
            from,
            to,
            text
        });
        return data;
    } catch (error) {
        console.error('Telnyx SMS error:', error);
        throw error;
    }
};

const initiateCall = async (from, to, connectionId) => {
    try {
        console.log(`Initiating call from ${from} to ${to} via connection ${connectionId}`);
        const { data } = await telnyxClient.calls.create({
            connection_id: connectionId,
            to: to,
            from: from,
            webhook_url: process.env.TELNYX_VOICE_WEBHOOK_URL || 'https://legacy-beacon-backend.vercel.app/api/webhooks/voice',
            answering_machine_detection: 'detect'
        });
        return data;
    } catch (error) {
        console.error('Telnyx call error:', error);
        throw error;
    }
};

module.exports = {
    searchAvailableNumbers,
    purchaseNumber,
    assignNumberToConnection,
    sendSms,
    initiateCall,
    telnyxClient
};
