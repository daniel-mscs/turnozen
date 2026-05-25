import { useEffect, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    CapApp.addListener("appUrlOpen", async ({ url }) => {
      if (url.startsWith("turnozen://")) {
        const code = new URL(url).searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
        await Browser.close();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#8B5CF6",
          fontFamily: "monospace",
        }}
      >
        carregando...
      </div>
    );

  if (!session) return <Login />;

  return <Home session={session} />;
}
