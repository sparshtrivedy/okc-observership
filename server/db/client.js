/**
 * DB client placeholder for Supabase/PostgreSQL integration.
 * Replace with real adapter implementation.
 */
export const db = {
  query: async (_sql, _params = []) => {
    throw new Error('Database client not configured. Connect Supabase/PostgreSQL in server/db/client.js');
  }
};
