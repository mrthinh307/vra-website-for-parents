require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Kiểm tra kết nối
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("Supervisor")
      .select("count")
      .limit(1);
    if (error) throw error;
    console.log("Supabase connection successful");
  } catch (error) {
    console.error("Supabase connection error:", error);
    throw error;
  }
};

testConnection();

module.exports = { supabase, testConnection };
