const telnyxService = require('../services/telnyxService');
const supabase = require('../config/supabase');

exports.searchNumbers = async (req, res) => {
    try {
        const { areaCode } = req.query;
        if (!areaCode) return res.status(400).json({ error: 'Area code is required' });
        
        const cleanAreaCode = String(areaCode).trim();
        const numbers = await telnyxService.searchAvailableNumbers(cleanAreaCode);
        res.json(numbers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.buyNumber = async (req, res) => {
    try {
        const { phoneNumber, agentId } = req.body;
        const requester = req.user;
        
        if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

        // 1. Purchase number in Telnyx
        const order = await telnyxService.purchaseNumber(phoneNumber);
        
        // 2. Assign to connection and messaging profile
        const connectionId = process.env.TELNYX_CONNECTION_ID;
        
        // Get Telnyx internal ID for the number
        let telnyxPhoneId = null;
        try {
            const { data: phoneNumbers } = await telnyxService.telnyxClient.phoneNumbers.list({
                filter: { phone_number: phoneNumber }
            });

            if (phoneNumbers && phoneNumbers.length > 0) {
                telnyxPhoneId = phoneNumbers[0].id;
                await telnyxService.assignNumberToConnection(telnyxPhoneId, connectionId);
            }
        } catch (assignErr) {
            console.warn('Could not assign number to connection:', assignErr.message);
        }

        // 3. Extract area code from phone number
        const extractedAreaCode = phoneNumber.replace(/\D/g, '').slice(1, 4); // Remove +1 and get next 3 digits

        // 4. Insert into phone_numbers registry
        const phoneRecord = {
            phone_number: phoneNumber,
            telnyx_phone_id: telnyxPhoneId,
            connection_id: connectionId,
            company_id: requester.company_id || null,
            assigned_to: agentId || null,
            status: agentId ? 'assigned' : 'available',
            area_code: extractedAreaCode,
            purchased_at: new Date().toISOString()
        };

        const { data: insertedPhone, error: insertError } = await supabase
            .from('phone_numbers')
            .insert([phoneRecord])
            .select()
            .single();

        if (insertError) {
            console.error('Failed to insert phone record:', insertError);
            // Continue anyway - number is purchased
        }

        // 5. If agentId provided, also update user's telnyx_number for backward compatibility
        if (agentId) {
            const { error: updateError } = await supabase
                .from('users')
                .update({ 
                    telnyx_number: phoneNumber,
                    connection_id: connectionId
                })
                .eq('id', agentId);

            if (updateError) {
                console.warn('Failed to update user telnyx_number:', updateError.message);
            }
        }

        res.json({ message: 'Number purchased and registered successfully', phoneNumber, record: insertedPhone });
    } catch (error) {
        console.error('Buy number error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Assign an existing number from registry to a user
exports.assignNumber = async (req, res) => {
    try {
        const { phoneNumberId, userId } = req.body;
        const requester = req.user;

        if (!phoneNumberId || !userId) {
            return res.status(400).json({ error: 'phoneNumberId and userId are required' });
        }

        // 1. Get the phone number record
        const { data: phoneRecord, error: phoneError } = await supabase
            .from('phone_numbers')
            .select('*')
            .eq('id', phoneNumberId)
            .single();

        if (phoneError || !phoneRecord) {
            return res.status(404).json({ error: 'Phone number not found in registry' });
        }

        // 2. Check company ownership (unless super_admin)
        if (requester.role !== 'super_admin' && phoneRecord.company_id !== requester.company_id) {
            return res.status(403).json({ error: 'You can only assign numbers from your company' });
        }

        // 3. Update the phone_numbers registry
        const { error: updatePhoneError } = await supabase
            .from('phone_numbers')
            .update({ 
                assigned_to: userId,
                status: 'assigned'
            })
            .eq('id', phoneNumberId);

        if (updatePhoneError) throw updatePhoneError;

        // 4. Update the user's telnyx_number
        const { error: updateUserError } = await supabase
            .from('users')
            .update({ 
                telnyx_number: phoneRecord.phone_number,
                connection_id: phoneRecord.connection_id
            })
            .eq('id', userId);

        if (updateUserError) throw updateUserError;

        res.json({ message: 'Number assigned successfully', phoneNumber: phoneRecord.phone_number });
    } catch (error) {
        console.error('Assign number error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Unassign a number (keep in registry but remove from user)
exports.unassignNumber = async (req, res) => {
    try {
        const { phoneNumberId } = req.body;
        const requester = req.user;

        if (!phoneNumberId) {
            return res.status(400).json({ error: 'phoneNumberId is required' });
        }

        // 1. Get the phone record
        const { data: phoneRecord, error: phoneError } = await supabase
            .from('phone_numbers')
            .select('*')
            .eq('id', phoneNumberId)
            .single();

        if (phoneError || !phoneRecord) {
            return res.status(404).json({ error: 'Phone number not found' });
        }

        // 2. Check ownership
        if (requester.role !== 'super_admin' && phoneRecord.company_id !== requester.company_id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const previousUserId = phoneRecord.assigned_to;

        // 3. Update registry to unassign
        const { error: updatePhoneError } = await supabase
            .from('phone_numbers')
            .update({ 
                assigned_to: null,
                status: 'available'
            })
            .eq('id', phoneNumberId);

        if (updatePhoneError) throw updatePhoneError;

        // 4. Clear user's telnyx_number if they had this number
        if (previousUserId) {
            const { error: updateUserError } = await supabase
                .from('users')
                .update({ 
                    telnyx_number: null,
                    connection_id: null
                })
                .eq('id', previousUserId)
                .eq('telnyx_number', phoneRecord.phone_number);

            if (updateUserError) {
                console.warn('Failed to clear user number:', updateUserError.message);
            }
        }

        res.json({ message: 'Number unassigned successfully' });
    } catch (error) {
        console.error('Unassign number error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all numbers in registry (for admin or company owner)
exports.getNumberRegistry = async (req, res) => {
    try {
        const requester = req.user;
        
        let query = supabase
            .from('phone_numbers')
            .select(`
                *,
                assigned_user:users!phone_numbers_assigned_to_fkey(id, name, email, role),
                company:companies!phone_numbers_company_id_fkey(id, name)
            `)
            .order('created_at', { ascending: false });

        // If not super_admin, filter by company
        if (requester.role !== 'super_admin' && requester.company_id) {
            query = query.eq('company_id', requester.company_id);
        }

        const { data, error } = await query;

        if (error) {
            // Fallback query without joins if foreign key issue
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('phone_numbers')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (fallbackError) throw fallbackError;
            return res.json({ numbers: fallbackData || [] });
        }

        res.json({ numbers: data || [] });
    } catch (error) {
        console.error('Get number registry error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get available (unassigned) numbers for a company
exports.getAvailableNumbers = async (req, res) => {
    try {
        const requester = req.user;

        let query = supabase
            .from('phone_numbers')
            .select('*')
            .eq('status', 'available')
            .order('purchased_at', { ascending: false });

        if (requester.role !== 'super_admin' && requester.company_id) {
            query = query.eq('company_id', requester.company_id);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ numbers: data || [] });
    } catch (error) {
        console.error('Get available numbers error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAgentNumber = async (req, res) => {
    try {
        const { agentId } = req.params;
        const { data, error } = await supabase
            .from('users')
            .select('telnyx_number')
            .eq('id', agentId)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendSms = async (req, res) => {
    try {
        const { contactId, text } = req.body;
        const agentId = req.user.id;

        // 1. Get agent's telnyx number
        const { data: agent, error: agentError } = await supabase
            .from('users')
            .select('telnyx_number')
            .eq('id', agentId)
            .single();

        if (agentError || !agent?.telnyx_number) {
            throw new Error('Agent does not have a provisioned Telnyx number');
        }

        // 2. Get contact's phone number
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('phone')
            .eq('id', contactId)
            .single();

        if (contactError || !contact?.phone) {
            throw new Error('Contact phone number not found');
        }

        // 3. Send SMS via Telnyx
        const result = await telnyxService.sendSms(agent.telnyx_number, contact.phone, text);

        // 4. Log interaction
        await supabase.from('interactions').insert({
            user_id: agentId,
            contact_id: contactId,
            type: 'SMS',
            content: text,
            status: 'Read'
        });

        res.json({ message: 'SMS sent successfully', result });
    } catch (error) {
        console.error('Send SMS error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.initiateCall = async (req, res) => {
    try {
        const { contactId } = req.body;
        const agentId = req.user.id;

        if (!contactId) {
            return res.status(400).json({ error: 'contactId is required' });
        }

        // 1. First try to get number from phone_numbers registry
        let fromNumber = null;
        let connectionId = process.env.TELNYX_CONNECTION_ID;

        const { data: phoneRecord, error: phoneError } = await supabase
            .from('phone_numbers')
            .select('phone_number, connection_id')
            .eq('assigned_to', agentId)
            .eq('status', 'assigned')
            .single();

        if (phoneRecord) {
            fromNumber = phoneRecord.phone_number;
            connectionId = phoneRecord.connection_id || connectionId;
        } else {
            // Fallback: Check user's telnyx_number for backward compatibility
            const { data: agent, error: agentError } = await supabase
                .from('users')
                .select('telnyx_number, connection_id')
                .eq('id', agentId)
                .single();

            if (agent?.telnyx_number) {
                fromNumber = agent.telnyx_number;
                connectionId = agent.connection_id || connectionId;
            }
        }

        if (!fromNumber) {
            return res.status(400).json({ error: 'Agent does not have a provisioned Telnyx number. Please contact your admin to assign a number.' });
        }

        // 2. Get contact's phone number
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('phone, name')
            .eq('id', contactId)
            .single();

        if (contactError || !contact?.phone) {
            return res.status(404).json({ error: 'Contact phone number not found' });
        }

        // 3. Format the destination number (ensure E.164 format)
        let toNumber = contact.phone.replace(/\D/g, '');
        if (!toNumber.startsWith('1') && toNumber.length === 10) {
            toNumber = '1' + toNumber;
        }
        if (!toNumber.startsWith('+')) {
            toNumber = '+' + toNumber;
        }

        console.log(`Initiating call from ${fromNumber} to ${toNumber} for agent ${agentId}`);

        // 4. Initiate call using the service
        const result = await telnyxService.initiateCall(fromNumber, toNumber, connectionId);

        // 5. Log interaction
        await supabase.from('interactions').insert({
            user_id: agentId,
            contact_id: contactId,
            type: 'Call',
            content: `Outgoing call initiated to ${contact.name || contact.phone}`,
            status: 'Read'
        });

        res.json({ 
            message: 'Call initiated successfully', 
            result,
            from: fromNumber,
            to: toNumber
        });
    } catch (error) {
        console.error('Initiate call error:', error);
        res.status(500).json({ error: error.message || 'Failed to initiate call' });
    }
};
