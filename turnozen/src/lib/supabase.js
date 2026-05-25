import { createClient } from "@supabase/supabase-js";
import { Browser } from "@capacitor/browser";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "turnozen://login",
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  await Browser.open({ url: data.url });
}