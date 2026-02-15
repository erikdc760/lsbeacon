const supabase = require('../config/supabase');

const agentController = {
  // Dashboard Stats
  getDashboardStats: async (req, res) => {
    try {
      // Return specific agent stats
      res.json({
        sales: [
            { name: '01/06', sales: 400 },
            { name: '01/07', sales: 700 },
            { name: '01/08', sales: 500 },
            { name: '01/09', sales: 900 },
            { name: '01/10', sales: 1100 },
            { name: '01/11', sales: 850 },
            { name: '01/12', sales: 1200 },
        ],
        dials: [
            { name: '01/06', dials: 200 },
            { name: '01/07', dials: 450 },
            { name: '01/08', dials: 300 },
            { name: '01/09', dials: 500 },
            { name: '01/10', dials: 350 },
            { name: '01/11', dials: 400 },
            { name: '01/12', dials: 550 },
        ]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching agent stats' });
    }
  },

  // Auto Dialer Queue
  getQueue: async (req, res) => {
      try {
          // Logic: fetching unscheduled calls assigned to this agent
           const queue = [1,2,3,4,5,6,7,8,9,10].map(i => ({
              id: `${i}0042`,
              location: 'CALIFORNIA, US',
              status: 'queue'
          }));
          res.json(queue);
      } catch (error) {
          res.status(500).json({ message: 'Error fetching queue' });
      }
  }
};

module.exports = agentController;
