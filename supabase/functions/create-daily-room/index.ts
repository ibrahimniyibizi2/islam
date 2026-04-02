import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Daily.co API base URL
const DAILY_API_URL = "https://api.daily.co/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const DAILY_API_KEY = Deno.env.get("DAILY_API_KEY");
    if (!DAILY_API_KEY) {
      throw new Error("DAILY_API_KEY is not configured");
    }

    const { nikahApplicationId, roomName, expiryMinutes = 120 } = await req.json();

    if (!nikahApplicationId || !roomName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: nikahApplicationId and roomName" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Creating Daily.co room for nikah application: ${nikahApplicationId}`);

    // Create room with Daily.co API
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "public", // Can be changed to "private" for password protection
        properties: {
          max_participants: 10,
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: true,
          enable_network_ui: true,
          enable_prejoin_ui: true,
          enable_hand_raising: true,
          start_video_off: false,
          start_audio_off: false,
          // Expire room after specified minutes
          exp: Math.floor(Date.now() / 1000) + (expiryMinutes * 60),
          // Recording options
          enable_recording: "cloud",
          // Language for UI
          lang: "en",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Daily.co API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to create room: ${errorText}`);
    }

    const roomData = await response.json();
    console.log("Room created successfully:", roomData);

    // Create meeting token for the Imam (optional, for additional security)
    const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: true,
          exp: Math.floor(Date.now() / 1000) + (expiryMinutes * 60),
        },
      }),
    });

    let imamToken = null;
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      imamToken = tokenData.token;
    }

    // Construct the room URL
    const roomUrl = `https://${DAILY_API_KEY.split("_")[0]}.daily.co/${roomName}`;
    const roomUrlWithToken = imamToken ? `${roomUrl}?t=${imamToken}` : roomUrl;

    // Update the nikah application with the meeting URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { error: updateError } = await supabase
        .from("nikah_applications")
        .update({
          status: "video_scheduled",
        })
        .eq("id", nikahApplicationId);

      if (updateError) {
        console.error("Error updating nikah application:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        roomUrl: roomUrlWithToken,
        roomName: roomName,
        expiryMinutes: expiryMinutes,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-daily-room:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
