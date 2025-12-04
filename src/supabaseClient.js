import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

export const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : {
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: "Supabase not configured" } }),
          createSignedUrl: async () => ({ error: { message: "Supabase not configured" } }),
        }),
      },
    };
