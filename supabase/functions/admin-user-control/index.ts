import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AdminAction = "disable" | "enable" | "reset_password" | "delete_auth";

type RequestBody = {
  action: AdminAction;
  userId: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: { persistSession: false },
    });

    const { data: authData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !authData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { data: callerProfile, error: callerProfileErr } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (callerProfileErr) {
      return json({ error: "Failed to verify permissions" }, 403);
    }
    if (callerProfile?.role !== "super_admin") {
      return json({ error: "Forbidden" }, 403);
    }

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    if (!body?.action || !body?.userId) {
      return json({ error: "Missing action or userId" }, 400);
    }
    if (!req.headers.get("Content-Type")?.includes("application/json")) {
      // don't hard fail: some clients omit this header
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    if (body.action === "disable") {
      const { error } = await admin.auth.admin.updateUserById(body.userId, { ban_duration: "876000h" });
      if (error) return json({ error: error.message }, 400);
      return json({ message: "User disabled" });
    }

    if (body.action === "enable") {
      const { error } = await admin.auth.admin.updateUserById(body.userId, { ban_duration: "none" });
      if (error) return json({ error: error.message }, 400);
      return json({ message: "User enabled" });
    }

    if (body.action === "reset_password") {
      const { data: userData, error: userErr } = await admin.auth.admin.getUserById(body.userId);
      if (userErr) return json({ error: userErr.message }, 400);

      const email = userData?.user?.email;
      if (!email) return json({ error: "User has no email" }, 400);

      const siteUrl = Deno.env.get("SITE_URL") || "";
      const redirectTo = siteUrl ? `${siteUrl.replace(/\/$/, "")}/login` : undefined;

      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: redirectTo ? { redirectTo } : undefined,
      });

      if (error) return json({ error: error.message }, 400);

      const link = data?.properties?.action_link;
      if (!link) return json({ error: "Could not generate recovery link" }, 400);

      return json({ message: "Recovery link generated", link });
    }

    if (body.action === "delete_auth") {
      const { error } = await admin.auth.admin.deleteUser(body.userId);
      if (error) return json({ error: error.message }, 400);
      return json({ message: "Auth user deleted" });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
