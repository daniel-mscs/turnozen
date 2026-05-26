import { createClient } from "@supabase/supabase-js";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

export async function signInWithGoogle() {
  const isNative = Capacitor.isNativePlatform();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: isNative ? "turnozen://login" : "https://turnozen.vercel.app",
      skipBrowserRedirect: isNative,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) throw error;

  if (isNative) {
    await Browser.open({ url: data.url });
  }
}