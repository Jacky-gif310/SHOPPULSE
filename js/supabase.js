const SUPABASE_URL = "https://zqrssmbhglyjhqmfzplh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xJJTHdGJuZjQtTTe4Duopw_JRcPwzbR";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("ShopPulse Supabase connection initialized.");

