import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { userId: string; title: string; body: string; data?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { userId, title, body: msgBody, data } = body;
  if (!userId || !title || !msgBody) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("push_token")
    .eq("id", userId)
    .single();

  if (error || !profile?.push_token) {
    return new Response(JSON.stringify({ sent: false, reason: "no_token" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: profile.push_token,
        title,
        body: msgBody,
        data,
        sound: "default",
      }),
    });

    if (!expoResponse.ok) {
      return new Response(JSON.stringify({ sent: false, reason: "expo_error" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ sent: false, reason: "network_error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
});
