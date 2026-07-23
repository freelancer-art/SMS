import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { societyId, visitorId, flatNo, visitorName, purpose, phone, checkInTime } = body;

    if (!societyId || !flatNo || !visitorName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: societyId, flatNo, visitorName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Asynchronously look up resident contact info
    const { data: member } = await supabase
      .from("Members")
      .select("OwnerName, ContactNo, Email")
      .eq("SocietyId", societyId)
      .eq("FlatNo", flatNo)
      .maybeSingle();

    // 2. Audit entry created in background
    await supabase.from("AuditLogs").insert({
      id: `AL-gate-${Date.now()}`,
      SocietyId: societyId,
      Timestamp: new Date().toISOString(),
      UserRole: "Gatekeeper",
      UserId: "GATE-01",
      UserName: "Gate Security",
      Action: "Gate Arrival Notification",
      Details: `Visitor '${visitorName}' (${purpose}) arrived for Flat ${flatNo}. Host: ${member?.OwnerName || 'Resident'}`
    });

    // 3. Dispatch simulated Web Push / SMS payload
    const notification = {
      title: `🚨 Gate Arrival: Flat ${flatNo}`,
      message: `${visitorName} (${purpose}) arrived at gate. Contact: ${phone || 'N/A'}`,
      recipient: member?.ContactNo || 'Flat Resident',
      timestamp: checkInTime || new Date().toISOString()
    };

    console.log("[Async Gate Notification Dispatched]:", notification);

    return new Response(
      JSON.stringify({
        success: true,
        notifiedHost: member?.OwnerName || "Resident",
        flatNo: flatNo,
        visitorName: visitorName,
        status: "Notification Queued"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
