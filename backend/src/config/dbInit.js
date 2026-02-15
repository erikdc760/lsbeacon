const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const migrations = [
    {
        name: 'uuid-ossp extension',
        query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    },
    {
        name: 'companies table',
        query: `
        CREATE TABLE IF NOT EXISTS public.companies (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          name text NOT NULL,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );`
    },
    {
        name: 'campaigns table and company extensions',
        query: `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'relations') THEN
                ALTER TABLE public.companies ADD COLUMN relations text;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'agency_name') THEN
                ALTER TABLE public.companies ADD COLUMN agency_name text;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'size') THEN
                ALTER TABLE public.companies ADD COLUMN size text;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'est_monthly_output') THEN
                ALTER TABLE public.companies ADD COLUMN est_monthly_output text;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'notes') THEN
                ALTER TABLE public.companies ADD COLUMN notes text;
            END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS public.campaigns (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
          name text NOT NULL,
          status text DEFAULT 'ACTIVE',
          start_date text,
          start_time text,
          end_date text,
          is_ongoing boolean DEFAULT false,
          daily_budget text,
          est_volume text,
          source text,
          lead_description text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );`
    },
    {
        name: 'users table',
        query: `
        CREATE TABLE IF NOT EXISTS public.users (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          email text UNIQUE NOT NULL,
          password text NOT NULL,
          name text,
          role text NOT NULL CHECK (role IN ('super_admin', 'company_owner', 'agent')),
          company_id uuid REFERENCES public.companies(id),
          status text DEFAULT 'offline',
          created_by uuid REFERENCES public.users(id),
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );`
    },
        {
                name: 'users.supervisor_id column',
                query: `
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                            AND table_name = 'users'
                            AND column_name = 'supervisor_id'
                    ) THEN
                        ALTER TABLE public.users
                            ADD COLUMN supervisor_id uuid REFERENCES public.users(id);
                    END IF;
                END $$;`
        },
        {
          name: 'migrate supervisors to owners',
          query: `
          DO $$
          BEGIN
              -- First remove the old constraint to allow the update or if we already changed it in the table definition
              -- In some PG versions/environments, we might need to drop and re-add the constraint if we changed it above
              -- But for now, let's just try to update.
              UPDATE public.users SET role = 'company_owner' WHERE role = 'supervisor';
          END $$;
          `
        },
        {
                name: 'users.supervisor_id column',
                query: `
                ALTER TABLE IF EXISTS public.users
                ADD COLUMN IF NOT EXISTS supervisor_id uuid REFERENCES public.users(id);
                `
        },
    {
        name: 'contacts table',
        query: `
        CREATE TABLE IF NOT EXISTS public.contacts (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          name text,
          first_name text,
          last_name text,
          phone text,
          email text,
          type text,
          timezone text,
          dnd boolean DEFAULT false,
          tags text[] DEFAULT '{}',
          company_id uuid REFERENCES public.companies(id),
          last_activity timestamp with time zone,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Ensure columns exist even if table was created previously
        ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS first_name text;
        ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS last_name text;
        ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS type text;
        ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS timezone text;
        ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS dnd boolean DEFAULT false;
        ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
        `
    },
    {
        name: 'leads table',
        query: `
        CREATE TABLE IF NOT EXISTS public.leads (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            contact_id uuid REFERENCES public.contacts(id),
            company_id uuid REFERENCES public.companies(id),
            assigned_to uuid REFERENCES public.users(id),
            status text DEFAULT 'queue',
            location text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );`
    },
    {
        name: 'leads.updated_at column',
        query: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'leads'
                  AND column_name = 'updated_at'
            ) THEN
                ALTER TABLE public.leads
                    ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
            END IF;
        END $$;`
    },
    {
        name: 'lead rules table',
        query: `
        CREATE TABLE IF NOT EXISTS public.lead_rules (
          id bigserial PRIMARY KEY,
          title text NOT NULL,
          description text NOT NULL,
          active boolean DEFAULT true,
          priority integer DEFAULT 0,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        INSERT INTO public.lead_rules (title, description, active, priority)
        SELECT 'Top Performance Priority', 'Give 20% more leads to agents with Sales > 10/mo', true, 1
        WHERE NOT EXISTS (SELECT 1 FROM public.lead_rules WHERE title = 'Top Performance Priority');

        INSERT INTO public.lead_rules (title, description, active, priority)
        SELECT 'New Agent Warming', 'Limit new agents to 10 uncalled leads/day', false, 2
        WHERE NOT EXISTS (SELECT 1 FROM public.lead_rules WHERE title = 'New Agent Warming');

        INSERT INTO public.lead_rules (title, description, active, priority)
        SELECT 'Equal Weighting', 'Default round-robin distribution', true, 3
        WHERE NOT EXISTS (SELECT 1 FROM public.lead_rules WHERE title = 'Equal Weighting');
        `
    },
    {
        name: 'lead redistributions table',
        query: `
        CREATE TABLE IF NOT EXISTS public.lead_redistributions (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          requested_by uuid REFERENCES public.users(id),
          note text,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );`
    },
    {
        name: 'dashboard directives table',
        query: `
        CREATE TABLE IF NOT EXISTS public.dashboard_directives (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          owner_name text NOT NULL,
          quote text NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        INSERT INTO public.dashboard_directives (owner_name, quote)
        SELECT 'ADMINISTRATOR COMMAND', 'VISION WITHOUT EXECUTION IS HALLUCINATION.'
        WHERE NOT EXISTS (SELECT 1 FROM public.dashboard_directives);
        `
    },
    {
        name: 'interactions table',
        query: `
        CREATE TABLE IF NOT EXISTS public.interactions (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id uuid REFERENCES public.users(id),
            contact_id uuid REFERENCES public.contacts(id),
            type text NOT NULL,
            content text,
            status text DEFAULT 'Unread',
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );`
    },
    {
        name: 'announcements table',
        query: `
        CREATE TABLE IF NOT EXISTS public.announcements (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          title text NOT NULL,
          content text NOT NULL,
          background text,
          link text,
          video_url text,
          company_id uuid REFERENCES public.companies(id),
          created_by uuid REFERENCES public.users(id),
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );`
    },
    {
        name: 'telnyx columns for users',
        query: `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'telnyx_number') THEN
                ALTER TABLE public.users ADD COLUMN telnyx_number text;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'connection_id') THEN
                ALTER TABLE public.users ADD COLUMN connection_id text;
            END IF;
        END $$;`
    },
    {
        name: 'phone_numbers registry table',
        query: `
        CREATE TABLE IF NOT EXISTS public.phone_numbers (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          phone_number text UNIQUE NOT NULL,
          telnyx_phone_id text,
          connection_id text,
          messaging_profile_id text,
          company_id uuid REFERENCES public.companies(id),
          assigned_to uuid REFERENCES public.users(id),
          status text DEFAULT 'available',
          area_code text,
          purchased_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Add indices for faster lookups
        CREATE INDEX IF NOT EXISTS idx_phone_numbers_company ON public.phone_numbers(company_id);
        CREATE INDEX IF NOT EXISTS idx_phone_numbers_assigned ON public.phone_numbers(assigned_to);
        CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON public.phone_numbers(status);
        `
    },
    {
        name: 'force schema cache reload',
        query: `NOTIFY pgrst, 'reload schema';`
    }
];

const initDatabase = async () => {
    // By default, DB migrations should not prevent the API from booting in dev.
    // Set REQUIRE_DB_INIT=true to make startup fail fast if migrations cannot run.
    const requireDbInit = String(process.env.REQUIRE_DB_INIT || '').toLowerCase() === 'true';

    // Only run if DB URL is available
    if (!process.env.SUPABASE_DB_URL) {
        console.error('❌ SUPABASE_DB_URL is missing in .env file.');
        return;
    }

    const client = new Client({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false } // Required for Supabase usage
    });

    try {
        console.log('🔄 Connecting to database...');
        await client.connect();
        console.log('✅ Connected to database.');

        for (const migration of migrations) {
            try {
                await client.query(migration.query);
                console.log(`✅ Ensured ${migration.name}.`);
            } catch (err) {
                console.error(`❌ Failed to run migration ${migration.name}:`, err.message);
                throw err;
            }
        }

        console.log('🚀 All database migrations completed successfully.');

    } catch (err) {
        console.error('❌ Database initialization error:', err.message);
        if (err.code === 'ENOTFOUND') {
            console.error('   👉 The hostname in SUPABASE_DB_URL could not be resolved.');
            console.error('   👉 This is often a DNS/network issue, or a wrong Supabase project reference.');
        } else if (err.code === '28P01') {
            console.error('   👉 Authentication failed. Check your database password.');
        }

        // In development, allow the API to boot even if migrations can't run.
        // For production (or when explicitly desired), fail fast.
        const nonFatalNetworkCodes = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNREFUSED']);
        if (!requireDbInit && nonFatalNetworkCodes.has(err.code)) {
            console.warn('⚠️  Skipping DB migrations because the database is unreachable.');
            console.warn('   👉 Set REQUIRE_DB_INIT=true to make startup fail fast instead.');
            return;
        }

        throw err;
    } finally {
        try {
            await client.end();
        } catch (_) {
            // ignore cleanup errors
        }
    }
};

module.exports = initDatabase;
