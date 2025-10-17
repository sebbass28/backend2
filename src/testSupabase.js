import { supabase } from "./supabaseClient.js";
(async () => {
  const { data, error } = await supabase.storage.listBuckets();
  if (error)
    return console.error("Supabase storage error:", error.message || error);
  console.log(
    "Buckets:",
    data.map((b) => b.name)
  );
})();
