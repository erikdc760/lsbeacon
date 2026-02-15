
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const ensureSupabaseConfigured = (res) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({
      message: 'Supabase is not configured on the server. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      code: 'SUPABASE_NOT_CONFIGURED'
    });
    return false;
  }
  return true;
};

const isSchemaCacheOrMissingTable = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('schema cache') || message.includes('could not find the table');
};

const adminController = {
  // List Companies (Admin)
  getCompanies: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Select all company columns - use * to avoid schema cache errors if columns don't exist
      const { data: companies, error: companiesError, count } = await supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (companiesError) throw companiesError;

      let campaignsByCompany = new Map();
      try {
        const { data: campaigns, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .in('company_id', (companies || []).map(c => c.id));

        if (campaignsError) throw campaignsError;

        for (const campaign of campaigns || []) {
          if (!campaignsByCompany.has(campaign.company_id)) campaignsByCompany.set(campaign.company_id, []);
          campaignsByCompany.get(campaign.company_id).push(campaign);
        }
      } catch (campaignsError) {
        if (!isSchemaCacheOrMissingTable(campaignsError)) throw campaignsError;
      }

      const companyIds = (companies || []).map(c => c.id);

      let users = [];
      if (companyIds.length) {
        const { data: companyUsers, error: usersError } = await supabase
          .from('users')
          .select('id,name,email,role,company_id,created_at')
          .in('company_id', companyIds);

        if (usersError) throw usersError;
        users = companyUsers || [];
      }

      const usersByCompany = new Map();
      for (const u of users) {
        if (!usersByCompany.has(u.company_id)) usersByCompany.set(u.company_id, []);
        usersByCompany.get(u.company_id).push(u);
      }

      const enriched = (companies || []).map(c => {
        const cu = usersByCompany.get(c.id) || [];
        const owners = cu.filter(u => u.role === 'company_owner');
        const supervisors = cu.filter(u => u.role === 'supervisor');
        const agents = cu.filter(u => u.role === 'agent');
        return {
          ...c,
          campaigns: campaignsByCompany.get(c.id) || [],
          owners,
          counts: {
            owners: owners.length,
            supervisors: supervisors.length,
            agents: agents.length,
            users: cu.length,
          }
        };
      });

      res.json({ companies: enriched, total: count || 0, page, limit });
    } catch (error) {
      console.error(error);
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error fetching companies${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Create Company
  createCompany: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const { name } = req.body;
      const { data, error } = await supabase
        .from('companies')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error creating company${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Remove Company
  removeCompany: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const { id } = req.params;
      
      // Delete users first if they are linked to the company (ON DELETE CASCADE might not be on users table depending on implementation)
      await supabase.from('users').delete().eq('company_id', id);
      
      // Delete campaigns explicitly (though cascade handles it)
      await supabase.from('campaigns').delete().eq('company_id', id);
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Company and associated protocol units removed successfully' });
    } catch (error) {
      console.error(error);
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error removing company${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Create Campaign
  createCampaign: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const { 
        name, 
        company_id, 
        start_date, 
        start_time, 
        end_date, 
        is_ongoing, 
        daily_budget, 
        est_volume, 
        source, 
        lead_description 
      } = req.body;

      // Sanitize numeric inputs to prevent DB type errors (e.g., if DB expects integer but gets decimal)
      const clean_daily_budget = daily_budget ? String(daily_budget).trim() : daily_budget;
      const clean_est_volume = est_volume ? String(parseInt(String(est_volume))) : est_volume;

      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          name,
          company_id,
          status: 'ACTIVE',
          start_date,
          start_time,
          end_date,
          is_ongoing,
          daily_budget: clean_daily_budget,
          est_volume: clean_est_volume,
          source,
          lead_description
        }])
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      if (isSchemaCacheOrMissingTable(error)) {
        return res.status(503).json({
          message: 'Campaigns table does not exist. Please run database migrations.',
          code: 'CAMPAIGNS_TABLE_MISSING'
        });
      }
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error creating campaign${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Get Campaigns
  getCampaigns: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: campaigns, error, count } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const companyIds = [...new Set((campaigns || []).map(c => c.company_id).filter(Boolean))];
      let companyById = new Map();
      if (companyIds.length) {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id,name')
          .in('id', companyIds);

        if (companiesError) throw companiesError;
        for (const company of companies || []) {
          companyById.set(company.id, company);
        }
      }

      const enriched = (campaigns || []).map(c => ({
        ...c,
        companies: c.company_id ? companyById.get(c.company_id) || null : null
      }));

      res.json({ campaigns: enriched, total: count || 0, page, limit });
    } catch (error) {
      console.error(error);
      if (isSchemaCacheOrMissingTable(error)) {
        return res.json({ campaigns: [] });
      }
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error fetching campaigns${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Remove Campaign
  removeCampaign: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Campaign removed successfully' });
    } catch (error) {
      console.error(error);
      if (isSchemaCacheOrMissingTable(error)) {
        return res.status(503).json({
          message: 'Campaigns table does not exist. Please run database migrations.',
          code: 'CAMPAIGNS_TABLE_MISSING'
        });
      }
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error removing campaign${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Update Campaign
  updateCampaign: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const { id } = req.params;
      const { 
        name, 
        company_id, 
        start_date, 
        start_time, 
        end_date, 
        is_ongoing, 
        daily_budget, 
        est_volume, 
        source, 
        lead_description,
        status
      } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (company_id !== undefined) updateData.company_id = company_id;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (start_time !== undefined) updateData.start_time = start_time;
      if (end_date !== undefined) updateData.end_date = end_date;
      if (is_ongoing !== undefined) updateData.is_ongoing = is_ongoing;
      if (daily_budget !== undefined) {
        updateData.daily_budget = daily_budget ? String(daily_budget).trim() : daily_budget;
      }
      if (est_volume !== undefined) {
        updateData.est_volume = est_volume ? String(parseInt(String(est_volume))) : est_volume;
      }
      if (source !== undefined) updateData.source = source;
      if (lead_description !== undefined) updateData.lead_description = lead_description;
      if (status !== undefined) updateData.status = status;

      const { data, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) return res.status(404).json({ message: 'Campaign not found' });

      res.json(data);
    } catch (error) {
      console.error(error);
      if (isSchemaCacheOrMissingTable(error)) {
        return res.status(503).json({
          message: 'Campaigns table does not exist. Please run database migrations.',
          code: 'CAMPAIGNS_TABLE_MISSING'
        });
      }
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error updating campaign${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Create Company Owner (Company + Admin User)
  createCompanyOwner: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    const { 
      name, 
      email, 
      password, 
      companyName,
      relations,
      agency_name,
      size,
      est_monthly_output,
      notes
    } = req.body;

    const normalizedEmail = String(email || '').toLowerCase().trim();

    if (!name || !normalizedEmail || !password || !companyName) {
      return res.status(400).json({ message: 'Name, email, password and company name are required' });
    }

    try {
      // 1. Check if user exists
      const { data: existingUsers, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .limit(1);

      if (existingError) throw existingError;

      if (existingUsers && existingUsers.length) {
        return res.status(409).json({ message: 'Email already exists', code: 'EMAIL_EXISTS' });
      }

      // 2. Create Company - start with base fields only
      // Additional fields (relations, agency_name, size, est_monthly_output, notes) require schema migration
      const companyData = { name: companyName };
      
      // Try to insert with optional fields, fall back to basic insert if schema doesn't have them
      let company, companyError;
      try {
        // First try with all fields
        const extendedData = { ...companyData };
        if (relations) extendedData.relations = relations;
        if (agency_name) extendedData.agency_name = agency_name;
        if (size) extendedData.size = size;
        if (est_monthly_output) extendedData.est_monthly_output = est_monthly_output;
        if (notes) extendedData.notes = notes;
        
        const result = await supabase
          .from('companies')
          .insert([extendedData])
          .select()
          .single();
        
        if (result.error && isSchemaCacheOrMissingTable(result.error)) {
          // Fallback: insert with only base fields
          const fallbackResult = await supabase
            .from('companies')
            .insert([companyData])
            .select()
            .single();
          company = fallbackResult.data;
          companyError = fallbackResult.error;
        } else {
          company = result.data;
          companyError = result.error;
        }
      } catch (err) {
        // Fallback on any error
        const fallbackResult = await supabase
          .from('companies')
          .insert([companyData])
          .select()
          .single();
        company = fallbackResult.data;
        companyError = fallbackResult.error;
      }
      
      if (companyError) throw companyError;
      const companyId = company.id;

      // 3. Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Create User
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'company_owner',
            company_id: companyId,
          },
        ])
        .select()
        .single();

      if (userError) {
         // Cleanup company if user creation fails
         await supabase.from('companies').delete().eq('id', companyId);
         if (userError.code === '23505') {
           return res.status(409).json({ message: 'Email already exists', code: 'EMAIL_EXISTS' });
         }
         throw userError;
      }

      res.status(201).json({ message: 'Company Owner created successfully', user: newUser, company });
    } catch (error) {
      console.error(error);
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        message: `Server error creating company owner${detail}`,
        error: error?.message,
        code: error?.code
      });
    }
  },

  // Auto Dialer
  getAutoDialerQueue: async (req, res) => {
    try {
      // In a real app, query 'leads' table with status 'queued' assigned to this admin/agent
      // const { data } = await supabase.from('leads').select('*').eq('status', 'queue');
      
      // Returning mock data for now based on frontend
      const queue = [1,2,3,4,5,6,7,8,9,10].map(i => ({
          id: `${i}0042`,
          location: 'CALIFORNIA, US',
          status: 'queue'
      }));
      res.json(queue);
    } catch (error) {
      console.error('Error fetching auto dialer queue:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Contacts (Reusing similar logic to Owner but isolated for Admin permissions if needed)
  getContacts: async (req, res) => {
    try {
      const { data, error } = await supabase.from('contacts').select('*');
      if (error) throw error;
      res.json(data);
    } catch (error) {
      // Fallback mock
      res.json([
        { id: '1', name: 'Mario Madra', phone: '(562) 523-6254', email: 'mark2@gmail.com', created: 'Nov 30, 2025 08:41 PM', lastActivity: '2 hours ago', tags: [] },
        { id: '2', name: 'Gabriel Angel', phone: '(909) 813-2599', email: 'ank2@gmail.com', created: 'Oct 13, 2025 10:27 AM', lastActivity: '2 months ago', tags: [] },
        { id: '3', name: 'Maria Arell', phone: '(760) 263-2591', email: 'mikk@gmail.com', created: 'Aug 18, 2025 11:10 AM', lastActivity: 'N/A', tags: [] },
      ]);
    }
  },

  // Conversations
  getConversations: async (req, res) => {
    try {
      // const { data } = await supabase.from('interactions').select('*');
      
      // Fallback mock
      res.json([
        { id: '1', name: 'Robert Johnson', type: 'SMS', content: 'Hey, I had a question about the policy you mentioned...', date: '10:15 AM', previousAttempts: 3, status: 'Unread' },
        { id: '2', name: 'Maria Garcia', type: 'Call', content: 'Missed Call', date: '09:30 AM', previousAttempts: 1, status: 'Read' },
        { id: '3', name: 'James Wilson', type: 'Voicemail', content: 'Voicemail (0:45) - Regarding the quote...', date: 'Yesterday', previousAttempts: 5, status: 'Unread' },
        { id: '4', name: 'Patricia Moore', type: 'SMS', content: 'Can we reschedule our call for 3 PM?', date: 'Yesterday', previousAttempts: 2, status: 'Responded' },
      ]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  },

  // Lead Designation
  getLeadStats: async (req, res) => {
      if (!ensureSupabaseConfigured(res)) return;
     try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { count: totalLeads, error: totalError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        const { count: unassignedCount, error: unassignedError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .is('assigned_to', null);

        if (unassignedError) throw unassignedError;

        const { count: activeFlow, error: activeError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', since);

        if (activeError) throw activeError;

        const { count: assignedCount, error: assignedError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .not('assigned_to', 'is', null);

        if (assignedError) throw assignedError;

        const total = totalLeads || 0;
        const assigned = assignedCount || 0;
        const distributionProgress = total > 0 ? Math.min(100, Math.round((assigned / total) * 100)) : 0;

        const { data: rules, error: rulesError } = await supabase
          .from('lead_rules')
          .select('id, title, description, active, priority')
          .order('priority', { ascending: true });

        if (rulesError) throw rulesError;

        res.json({
          unassigned: unassignedCount || 0,
          activeFlow: activeFlow || 0,
          distributionProgress,
          rules: (rules || []).map(r => ({
            id: r.id,
            title: r.title,
            desc: r.description,
            active: r.active
          }))
        });
     } catch (error) {
        console.error(error);
        if (isSchemaCacheOrMissingTable(error)) {
          return res.json({
            unassigned: 0,
            activeFlow: 0,
            distributionProgress: 0,
            rules: [
              { id: 1, title: 'Top Performance Priority', desc: 'Give 20% more leads to agents with Sales > 10/mo', active: true },
              { id: 2, title: 'New Agent Warming', desc: 'Limit new agents to 10 uncalled leads/day', active: false },
              { id: 3, title: 'Equal Weighting', desc: 'Default round-robin distribution', active: true }
            ]
          });
        }
        res.status(500).json({ error: 'Failed to fetch lead stats' });
     }
  },

  triggerRedistribution: async (req, res) => {
      if (!ensureSupabaseConfigured(res)) return;
     try {
       const requestedBy = req.user?.id || null;
       const note = req.body?.note || null;
       const { error } = await supabase
         .from('lead_redistributions')
         .insert([{ requested_by: requestedBy, note }]);

       if (error) throw error;
       res.json({ success: true, message: 'Redistribution triggered' });
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Failed to trigger redistribution' });
     }
  },

  updateLeadRule: async (req, res) => {
      if (!ensureSupabaseConfigured(res)) return;
      try {
        const { id } = req.params;
        const { active } = req.body;
        const ruleId = Number(id);

        if (!Number.isFinite(ruleId)) {
          return res.status(400).json({ error: 'Invalid rule id' });
        }

        // First check if the rule exists
        const { data: existingRule, error: fetchError } = await supabase
          .from('lead_rules')
          .select('id, title, description, active')
          .eq('id', ruleId)
          .single();

        if (fetchError) {
          // If table doesn't exist or schema cache error, return mock success
          if (isSchemaCacheOrMissingTable(fetchError)) {
            const mockRules = [
              { id: 1, title: 'Top Performance Priority', desc: 'Give 20% more leads to agents with Sales > 10/mo', active: Boolean(active) },
              { id: 2, title: 'New Agent Warming', desc: 'Limit new agents to 10 uncalled leads/day', active: Boolean(active) },
              { id: 3, title: 'Equal Weighting', desc: 'Default round-robin distribution', active: Boolean(active) }
            ];
            const mockRule = mockRules.find(r => r.id === ruleId);
            if (mockRule) {
              return res.json({ success: true, rule: mockRule });
            }
          }
          throw fetchError;
        }

        if (!existingRule) {
          return res.status(404).json({ error: 'Rule not found' });
        }

        const { data, error } = await supabase
          .from('lead_rules')
          .update({ active: Boolean(active), updated_at: new Date().toISOString() })
          .eq('id', ruleId)
          .select('id, title, description, active')
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Rule not found' });

        res.json({ success: true, rule: { id: data.id, title: data.title, desc: data.description, active: data.active } });
      } catch (error) {
        console.error(error);
        // If schema cache or missing table error, return mock success for known rule IDs
        if (isSchemaCacheOrMissingTable(error)) {
          const ruleId = Number(req.params.id);
          const { active } = req.body;
          const mockRules = [
            { id: 1, title: 'Top Performance Priority', desc: 'Give 20% more leads to agents with Sales > 10/mo', active: Boolean(active) },
            { id: 2, title: 'New Agent Warming', desc: 'Limit new agents to 10 uncalled leads/day', active: Boolean(active) },
            { id: 3, title: 'Equal Weighting', desc: 'Default round-robin distribution', active: Boolean(active) }
          ];
          const mockRule = mockRules.find(r => r.id === ruleId);
          if (mockRule) {
            return res.json({ success: true, rule: mockRule });
          }
        }
        res.status(500).json({ error: 'Failed to update rule' });
      }
  },

  // Phantom Mode
  getPhantomStats: async (req, res) => {
      if (!ensureSupabaseConfigured(res)) return;
      try {
          const { company_id: companyId } = req.query;
          const startOfDay = new Date();
          startOfDay.setUTCHours(0, 0, 0, 0);

          let liveAgentsQuery = supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'online')
            .eq('role', 'agent');

          if (companyId) liveAgentsQuery = liveAgentsQuery.eq('company_id', companyId);

          const { count: liveAgents, error: liveError } = await liveAgentsQuery;
          if (liveError) throw liveError;

          let dialsQuery = supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfDay.toISOString());

          if (companyId) dialsQuery = dialsQuery.eq('company_id', companyId);

          const { count: dailyDials, error: dialsError } = await dialsQuery;
          if (dialsError) throw dialsError;

          res.json({
              liveAgents: liveAgents || 0,
              dailyDials: dailyDials || 0
          });
      } catch (error) {
           res.status(500).json({ error: 'Failed to fetch phantom stats' });
      }
  },

  // Dashboard Directives
  getDashboardDirectives: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const { data, error } = await supabase
        .from('dashboard_directives')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let directive = data && data[0];

      if (!directive) {
        const { data: created, error: createError } = await supabase
          .from('dashboard_directives')
          .insert([{ owner_name: 'ADMINISTRATOR COMMAND', quote: 'VISION WITHOUT EXECUTION IS HALLUCINATION.' }])
          .select()
          .single();

        if (createError) throw createError;
        directive = created;
      }

      res.json({ owner_name: directive.owner_name, quote: directive.quote, updated_at: directive.updated_at });
    } catch (error) {
      console.error(error);
      if (isSchemaCacheOrMissingTable(error)) {
        return res.json({
          owner_name: 'ADMINISTRATOR COMMAND',
          quote: 'VISION WITHOUT EXECUTION IS HALLUCINATION.',
          updated_at: null,
          warning: 'dashboard_directives table missing'
        });
      }
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        error: `Failed to fetch dashboard directives${detail}`,
        code: error?.code
      });
    }
  },

  updateDashboardDirectives: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const ownerName = String(req.body?.owner_name || '').trim();
      const quote = String(req.body?.quote || '').trim();

      if (!ownerName || !quote) {
        return res.status(400).json({ error: 'Owner name and quote are required' });
      }

      const { data: existing, error: existingError } = await supabase
        .from('dashboard_directives')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (existingError) throw existingError;

      let updated;
      if (existing && existing.length) {
        const { data, error } = await supabase
          .from('dashboard_directives')
          .update({ owner_name: ownerName, quote, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select()
          .single();

        if (error) throw error;
        updated = data;
      } else {
        const { data, error } = await supabase
          .from('dashboard_directives')
          .insert([{ owner_name: ownerName, quote }])
          .select()
          .single();

        if (error) throw error;
        updated = data;
      }

      res.json({ owner_name: updated.owner_name, quote: updated.quote, updated_at: updated.updated_at });
    } catch (error) {
      console.error(error);
      if (isSchemaCacheOrMissingTable(error)) {
        // Return success with the submitted values so UI doesn't break
        return res.json({
          owner_name: req.body?.owner_name || 'ADMINISTRATOR COMMAND',
          quote: req.body?.quote || 'VISION WITHOUT EXECUTION IS HALLUCINATION.',
          updated_at: null,
          warning: 'Directives table missing. Changes not persisted.'
        });
      }
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        error: `Failed to update dashboard directives${detail}`,
        code: error?.code
      });
    }
  },

  // Dashboard Aggregates
  getDashboardAggregates: async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;
    try {
      const { count: companyCount, error: cErr } = await supabase.from('companies').select('*', { count: 'exact', head: true });
      const { count: agentCount, error: aErr } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'agent');
      const { count: campaignCount, error: cpErr } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });

      if (cErr || aErr || cpErr) {
        throw cErr || aErr || cpErr;
      }

      res.json({
        totalCompanies: companyCount || 0,
        totalAgents: agentCount || 0,
        totalCampaigns: campaignCount || 0,
        activeDeployments: campaignCount || 0, // Mocking same as campaigns for now
      });
    } catch (error) {
      console.error(error);
      if (isSchemaCacheOrMissingTable(error)) {
        return res.json({
          totalCompanies: 0,
          totalAgents: 0,
          totalCampaigns: 0,
          activeDeployments: 0
        });
      }
      const detail = error?.message ? `: ${error.message}` : '';
      res.status(500).json({
        error: `Failed to fetch dashboard aggregates${detail}`,
        code: error?.code
      });
    }
  }
};

module.exports = adminController;
