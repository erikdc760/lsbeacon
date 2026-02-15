const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const isMissingColumnError = (err, columnName) => {
  // PostgREST (Supabase) often returns messages like: "column users.supervisor_id does not exist"
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('does not exist') && msg.includes(String(columnName).toLowerCase());
};

const companyController = {
  // Create Agent
  createUser: async (req, res) => {
    const { name, email, password, role, supervisorId } = req.body; // role: 'agent'
    const requester = req.user;

    if (!requester?.company_id) {
      return res.status(400).json({ message: 'Missing company context for requester.' });
    }

    if (role !== 'agent') {
      return res.status(400).json({ message: 'Invalid role. Must be agent.' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required.' });
    }

    const emailLower = normalizeEmail(email);

    try {
      // 1. Check existence
      const { data: existing } = await supabase.from('users').select('id').eq('email', emailLower).single();
      if (existing) return res.status(400).json({ message: 'User already exists' });

      // 1b. If creating an agent, optionally validate supervisorId (which is now an owner)
      let validatedSupervisorId = null;
      if (role === 'agent' && supervisorId) {
        const { data: sup, error: supErr } = await supabase
          .from('users')
          .select('id, role, company_id')
          .eq('id', supervisorId)
          .single();

        if (supErr || !sup) {
          return res.status(404).json({ message: 'Owner not found' });
        }
        if (sup.company_id !== requester.company_id) {
          return res.status(403).json({ message: 'Owner is not in your company' });
        }
        if (sup.role !== 'company_owner') {
          return res.status(400).json({ message: 'Provided supervisorId must be the company owner' });
        }
        validatedSupervisorId = sup.id;
      }

      // 2. Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Create
      const insertPayload = {
        name,
        email: emailLower,
        password: hashedPassword,
        role: 'agent',
        company_id: requester.company_id,
        created_by: requester.id,
      };

      if (validatedSupervisorId) {
        insertPayload.supervisor_id = validatedSupervisorId;
      } else if (requester.role === 'company_owner') {
        // Auto-assign to the requester if they are an owner
        insertPayload.supervisor_id = requester.id;
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([insertPayload])
        .select('id,name,email,role,company_id,supervisor_id,created_at')
        .single();

      if (error) throw error;

      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
       console.error(error);
       if (isMissingColumnError(error, 'supervisor_id')) {
         return res.status(500).json({
           message: 'Database schema missing supervisor_id column. Add users.supervisor_id to support agent assignment.',
           error: error.message,
         });
       }
       res.status(500).json({ message: `Server error: ${error.message}`, error: error.message });
    }
  },

  // List company users (Owner only)
  listUsers: async (req, res) => {
    const requester = req.user;
    if (!requester?.company_id) {
      return res.status(400).json({ message: 'Missing company context for requester.' });
    }

    const role = String(req.query.role || 'all').toLowerCase();
    const allowed = new Set(['all', 'agent', 'supervisor', 'company_owner']);
    if (!allowed.has(role)) {
      return res.status(400).json({ message: 'Invalid role filter.' });
    }

    try {
      let query = supabase
        .from('users')
        .select('id,name,email,role,company_id,supervisor_id,telnyx_number,created_at')
        .eq('company_id', requester.company_id)
        .order('created_at', { ascending: true });

      if (role !== 'all') {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) {
        // Fallback: If telnyx_number column is missing, try fetching without it
        if (error.message && error.message.toLowerCase().includes('column') && error.message.toLowerCase().includes('telnyx_number')) {
            console.warn('Recovering from missing telnyx_number column...');
            let fallbackQuery = supabase
                .from('users')
                .select('id,name,email,role,company_id,supervisor_id,created_at')
                .eq('company_id', requester.company_id)
                .order('created_at', { ascending: true });
            
            if (role !== 'all') fallbackQuery = fallbackQuery.eq('role', role);
            
            const { data: fallbackData, error: fallbackError } = await fallbackQuery;
            if (fallbackError) throw fallbackError;
            return res.json({ users: fallbackData || [] });
        }
        throw error;
      };
      res.json({ users: data || [] });
    } catch (error) {
      console.error(error);
      if (isMissingColumnError(error, 'supervisor_id')) {
        return res.status(500).json({
          message: 'Database schema missing supervisor_id column. Add users.supervisor_id to support hierarchy and assignment.',
          error: error.message,
        });
      }
      res.status(500).json({ message: `Server error: ${error.message}`, error: error.message });
    }
  },

  // Assign/unassign an agent to a supervisor (Owner only)
  assignAgentToSupervisor: async (req, res) => {
    const requester = req.user;
    const { agentId, supervisorId } = req.body;

    if (!requester?.company_id) {
      return res.status(400).json({ message: 'Missing company context for requester.' });
    }

    if (!agentId) {
      return res.status(400).json({ message: 'agentId is required.' });
    }

    try {
      const { data: agent, error: agentErr } = await supabase
        .from('users')
        .select('id, role, company_id')
        .eq('id', agentId)
        .single();

      if (agentErr || !agent) return res.status(404).json({ message: 'Agent not found' });
      if (agent.company_id !== requester.company_id) return res.status(403).json({ message: 'Agent not in your company' });
      if (agent.role !== 'agent') return res.status(400).json({ message: 'Target user is not an agent' });

      let newSupervisorId = null;
      if (supervisorId) {
        const { data: supervisor, error: supErr } = await supabase
          .from('users')
          .select('id, role, company_id')
          .eq('id', supervisorId)
          .single();

        if (supErr || !supervisor) return res.status(404).json({ message: 'Supervisor not found' });
        if (supervisor.company_id !== requester.company_id) return res.status(403).json({ message: 'Supervisor not in your company' });
        if (supervisor.role !== 'supervisor') return res.status(400).json({ message: 'Target supervisorId is not a supervisor' });
        newSupervisorId = supervisor.id;
      }

      const { data: updated, error: updateErr } = await supabase
        .from('users')
        .update({ supervisor_id: newSupervisorId })
        .eq('id', agentId)
        .select('id,name,email,role,company_id,supervisor_id')
        .single();

      if (updateErr) throw updateErr;
      res.json({ message: 'Agent assignment updated', user: updated });
    } catch (error) {
      console.error(error);
      if (isMissingColumnError(error, 'supervisor_id')) {
        return res.status(500).json({
          message: 'Database schema missing supervisor_id column. Add users.supervisor_id to support agent assignment.',
          error: error.message,
        });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Hierarchy: owner -> agents
  getHierarchy: async (req, res) => {
    const requester = req.user;
    if (!requester?.company_id) {
      return res.status(400).json({ message: 'Missing company context for requester.' });
    }

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id,name,email,role,company_id,supervisor_id,created_at')
        .eq('company_id', requester.company_id);

      if (error) throw error;

      const owner = (users || []).find(u => u.role === 'company_owner') || null;
      const agents = (users || []).filter(u => u.role === 'agent');
      
      const managedAgents = [];
      const unassignedAgents = [];

      for (const agent of agents) {
        if (owner && agent.supervisor_id === owner.id) {
          managedAgents.push(agent);
        } else {
          unassignedAgents.push(agent);
        }
      }

      res.json({ owner, agents: managedAgents, unassignedAgents });
    } catch (error) {
      console.error(error);
      if (isMissingColumnError(error, 'supervisor_id')) {
        return res.status(500).json({
          message: 'Database schema missing supervisor_id column. Add users.supervisor_id to support hierarchy.',
          error: error.message,
        });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Promote Agent to Supervisor
  promoteUser: async (req, res) => {
    const { userId } = req.body;
    
    try {
      const { data: targetUser, error: fetchError } = await supabase.from('users').select('*').eq('id', userId).single();
      
      if (fetchError || !targetUser) return res.status(404).json({ message: 'User not found' });
      
      // Check if target belongs to same company
      if (targetUser.company_id !== req.user.company_id) {
        return res.status(403).json({ message: 'Unauthorized access to user' });
      }

      if (targetUser.role !== 'agent') {
        return res.status(400).json({ message: 'User is not an agent' });
      }

      const { error: updateError } = await supabase.from('users').update({ role: 'supervisor' }).eq('id', userId);
      
      if (updateError) throw updateError;

      res.json({ message: 'User promoted to supervisor successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Transfer Ownership
  transferOwnership: async (req, res) => {
    const { newOwnerId } = req.body;
    const currentOwner = req.user;

    try {
       const { data: targetUser } = await supabase.from('users').select('*').eq('id', newOwnerId).single();
       if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

       if (targetUser.company_id !== currentOwner.company_id) {
         return res.status(403).json({ message: 'Target user not in your company' });
       }

       // Transaction like logic
       // 1. Demote current owner to Agent
       const { error: demoteError } = await supabase.from('users').update({ role: 'agent' }).eq('id', currentOwner.id);
       if (demoteError) throw demoteError;

       // 2. Promote target to Company Owner
       const { error: promoteError } = await supabase.from('users').update({ role: 'company_owner' }).eq('id', newOwnerId);
       if (promoteError) {
         // Rollback attempt
         await supabase.from('users').update({ role: 'company_owner' }).eq('id', currentOwner.id);
         throw promoteError;
       }

       res.json({ message: 'Ownership transferred successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during transfer' });
    }
  }
};

module.exports = companyController;
