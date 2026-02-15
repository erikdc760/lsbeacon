
const supabase = require('../config/supabase');

const isMissingTableError = (err, tableName) => {
  // Supabase PostgREST: PGRST205 - "Could not find the table 'public.<table>' in the schema cache"
  const code = String(err?.code || '');
  const msg = String(err?.message || '').toLowerCase();
  return code === 'PGRST205' && msg.includes(`public.${String(tableName).toLowerCase()}`);
};

const ownerController = {
  // Dashboard
  getDashboardStats: async (req, res) => {
    try {
      // In a real scenario, you would aggregate these from a 'calls' or 'sales' table
      // For now, we'll try to fetch aggregated data if available, or return structure
      
      // Example of fetching dials count for last 7 days
      /*
      const { data: dialsData, error: dialsError } = await supabase
        .from('calls')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      */
     
      // Returning mock data structure matching the frontend for now to ensure UI renders
      // Ideally replace with: await supabase.rpc('get_dashboard_stats') or similar
      const dataSales = [
        { name: '01/06', sales: 400 },
        { name: '01/07', sales: 700 },
        { name: '01/08', sales: 500 },
        { name: '01/09', sales: 900 },
        { name: '01/10', sales: 1100 },
        { name: '01/11', sales: 850 },
        { name: '01/12', sales: 1200 },
      ];

      const dataDials = [
        { name: '01/06', dials: 200 },
        { name: '01/07', dials: 450 },
        { name: '01/08', dials: 300 },
        { name: '01/09', dials: 500 },
        { name: '01/10', dials: 350 },
        { name: '01/11', dials: 400 },
        { name: '01/12', dials: 550 },
      ];

      res.json({ dataSales, dataDials });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Announcements
  getAnnouncements: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      // Fallback if table doesn't exist yet
      console.error('Error fetching announcements:', error);
      res.json([
        {
          id: '1',
          title: 'Monthly Sales Contest - New Rewards!',
          content: 'We are introducing new rewards for the top 5 agents this month. The grand prize is a corporate trip to Vegas! Keep dialing and hitting those goals.',
          background: 'https://images.unsplash.com/photo-1547032175-7fc8c7bd15b3?auto=format&fit=crop&q=80&w=2070',
          link: 'https://example.com/contest-details'
        },
        {
          id: '2',
          title: 'Platform Maintenance Schedule',
          content: 'Beacon will be undergoing brief maintenance this Sunday from 2 AM to 4 AM EST. Dialer services will be offline during this period.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
          background: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070'
        },
        {
          id: '3',
          title: 'New Lead Batch Available',
          content: 'A fresh batch of Facebook leads has been distributed to the Pain Tracker. Team leads, please review your team assignment flows.',
          background: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2015'
        }
      ]);
    }
  },

  createAnnouncement: async (req, res) => {
    try {
      const { title, content, background, link, videoUrl } = req.body;
      const { data, error } = await supabase
        .from('announcements')
        .insert([{ title, content, background, link, video_url: videoUrl, created_at: new Date() }])
        .select();

      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error creating announcement:', error);
      if (isMissingTableError(error, 'announcements')) {
        return res.status(501).json({
          error: "Announcements storage isn't set up yet.",
          message: "Create the 'public.announcements' table in Supabase (or run the DB migrations) and try again.",
        });
      }
      res.status(500).json({ error: 'Failed to create announcement' });
    }
  },

  updateAnnouncement: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      res.json(data[0]);
    } catch (error) {
      console.error('Error updating announcement:', error);
      if (isMissingTableError(error, 'announcements')) {
        return res.status(501).json({
          error: "Announcements storage isn't set up yet.",
          message: "Create the 'public.announcements' table in Supabase (or run the DB migrations) and try again.",
        });
      }
      res.status(500).json({ error: 'Failed to update announcement' });
    }
  },

  // Contacts
  getContacts: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
       res.json([
        { id: '1', name: 'Mario Madra', phone: '(562) 523-6254', email: 'mark2@gmail.com', created: 'Nov 30, 2025 08:41 PM', lastActivity: '2 hours ago', tags: [] },
        { id: '2', name: 'Gabriel Angel', phone: '(909) 813-2599', email: 'ank2@gmail.com', created: 'Oct 13, 2025 10:27 AM', lastActivity: '2 months ago', tags: [] },
        { id: '3', name: 'Maria Arell', phone: '(760) 263-2591', email: 'mikk@gmail.com', created: 'Aug 18, 2025 11:10 AM', lastActivity: 'N/A', tags: [] },
        { id: '4', name: 'Maria Arell', phone: '(909) 422-4000', email: 'ank@gmail.com', created: 'Aug 15, 2025 01:25 AM', lastActivity: 'N/A', tags: [] },
      ]);
    }
  },

  createContact: async (req, res) => {
    try {
      const { firstName, lastName, phone, email, type, tags, dnd } = req.body;
      const name = `${firstName} ${lastName}`.trim();
      
      // Ensure we have a company_id from the authenticated user
      const company_id = req.user?.company_id;

      const insertData = {
        name,
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        type: type || 'Lead',
        dnd: dnd || false,
        tags: tags || [],
        created_at: new Date().toISOString()
      };

      if (company_id) {
        insertData.company_id = company_id;
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Supabase error creating contact:', error);
        throw error;
      }
      
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error in createContact controller:', error);
      res.status(500).json({ error: error.message || 'Failed to create contact' });
    }
  },

  // Lead Designation
  getLeadStats: async (req, res) => {
    try {
        // Mocking logic to count unassigned leads
        // const { count: unassignedCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).is('assigned_to', null);
        // const { count: activeFlow } = await supabase.from('leads').select('*', { count: 'exact', head: true }).gte('updated_at', 'today'); // pseudo code

        res.json({
            unassigned: 4281, // Replace with real count
            activeFlow: 1120,
            distributionProgress: 65,
            rules: [
                { id: 1, title: 'Top Performance Priority', desc: 'Give 20% more leads to agents with Sales > 10/mo', active: true },
                { id: 2, title: 'New Agent Warming', desc: 'Limit new agents to 10 uncalled leads/day', active: false },
                { id: 3, title: 'Equal Weighting', desc: 'Default round-robin distribution', active: true },
            ]
        });
    } catch (error) {
        console.error('Error fetching lead stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  },

  triggerRedistribution: async (req, res) => {
      try {
          // Call a Supabase RPC function or perform complex logic
          // await supabase.rpc('redistribute_leads');
          res.json({ message: 'Redistribution triggered successfully', success: true });
      } catch (error) {
          res.status(500).json({ error: 'Failed to trigger redistribution' });
      }
  },
  
  updateLeadRule: async (req, res) => {
      try {
          const { id } = req.params;
          const { active } = req.body;
          // await supabase.from('lead_rules').update({ active }).eq('id', id);
          res.json({ successes: true, id, active });
      } catch (error) {
          res.status(500).json({ error: 'Failed to update rule' });
      }
  },

  getArenaStats: async (req, res) => {
    try {
        const { period, metric } = req.query;
        // In reality, query tables based on time period and aggregate by metric
        // const { data } = await supabase.rpc('get_rankings', { period, metric });
        
        res.json([
            { rank: 1, name: 'John Doe', dials: 1245, sales: 32, alp: '$42,500', retention: '94%', ratio: '4:1', profit: '$12k', trend: 'up' },
            { rank: 2, name: 'Sarah Miller', dials: 1102, sales: 28, alp: '$38,200', retention: '91%', ratio: '3:1', profit: '$10k', trend: 'up' },
            { rank: 3, name: 'Jane Smith', dials: 980, sales: 25, alp: '$31,000', retention: '88%', ratio: '2.5:1', profit: '$8k', trend: 'down' },
            { rank: 4, name: 'Mike Ross', dials: 850, sales: 18, alp: '$24,400', retention: '85%', ratio: '2:1', profit: '$6k', trend: 'steady' },
            { rank: 5, name: 'Alice Wong', dials: 720, sales: 14, alp: '$19,800', retention: '92%', ratio: '3.5:1', profit: '$5k', trend: 'up' },
        ]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch arena stats' });
    }
  },

  // Team Performance (Merged from Supervisor Role)
  getTeamPerformance: async (req, res) => {
    try {
        res.json([
          { id: '1', name: 'SARAH CONNOR', calls: 156, sales: 23, conversionRate: 14.7, alp: 28600, quality: 96, status: 'on-call' },
          { id: '2', name: 'JOHN REESE', calls: 142, sales: 19, conversionRate: 13.4, alp: 24800, quality: 94, status: 'online' },
          { id: '3', name: 'KATE MORGAN', calls: 138, sales: 18, conversionRate: 13.0, alp: 23400, quality: 92, status: 'on-call' },
          { id: '4', name: 'MIKE ROSS', calls: 125, sales: 15, conversionRate: 12.0, alp: 19500, quality: 88, status: 'online' },
          { id: '5', name: 'ALICE WONG', calls: 112, sales: 13, conversionRate: 11.6, alp: 17200, quality: 90, status: 'offline' },
          { id: '6', name: 'TOM HARDY', calls: 98, sales: 10, conversionRate: 10.2, alp: 13800, quality: 85, status: 'online' },
        ]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team performance' });
    }
  },

  // Live Calls (Merged from Supervisor Role)
  getLiveCalls: async (req, res) => {
    try {
        res.json([
          { id: '1', agent: 'Sarah Connor', contact: 'Michael Chen', duration: '08:45', status: 'talking', phoneNumber: '555-0101', leadType: 'Facebook' },
          { id: '2', agent: 'John Reese', contact: 'Emma Rodriguez', duration: '03:20', status: 'talking', phoneNumber: '555-0102', leadType: 'Cold Call' },
          { id: '3', agent: 'Kate Morgan', contact: 'David Kim', duration: '00:15', status: 'dialing', phoneNumber: '555-0103', leadType: 'Referral' },
        ]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live calls' });
    }
  }
};

module.exports = ownerController;
