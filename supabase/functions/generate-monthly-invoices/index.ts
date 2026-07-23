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
    const {
      societyId,
      monthYear,
      dueDate,
      maintenanceRatePerSqFt = 2.5,
      fixedWaterCharges = 350,
      parkingCharges = 500,
      securityCharges = 400
    } = body;

    if (!societyId || !monthYear || !dueDate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: societyId, monthYear, dueDate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch active members using optimized projection
    const { data: members, error: memberErr } = await supabase
      .from("Members")
      .select("id, FlatNo, OwnerName, AreaSqFt")
      .eq("SocietyId", societyId);

    if (memberErr) {
      throw memberErr;
    }

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: "No members found for this society" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Generate itemized bulk invoices
    const issuedDate = new Date().toISOString().split("T")[0];
    const invoicesToInsert = members.map((member) => {
      const area = parseFloat(String(member.AreaSqFt || 1000));
      const baseAmount = Math.round(area * maintenanceRatePerSqFt);
      const totalAmount = baseAmount + fixedWaterCharges + parkingCharges + securityCharges;

      return {
        id: `INV-${societyId}-${member.FlatNo}-${Date.now().toString(36)}`,
        SocietyId: societyId,
        BillMonth: monthYear,
        FlatNo: member.FlatNo,
        OwnerName: member.OwnerName,
        BaseAmount: baseAmount,
        WaterCharges: fixedWaterCharges,
        SecurityCharges: securityCharges,
        ParkingCharges: parkingCharges,
        TotalAmount: totalAmount,
        DueDate: dueDate,
        Status: "Unpaid",
        IssuedDate: issuedDate
      };
    });

    // 3. Single-transaction batch insert to Supabase REST database
    const { error: insertErr } = await supabase
      .from("Invoices")
      .insert(invoicesToInsert);

    if (insertErr) {
      throw insertErr;
    }

    const totalRevenue = invoicesToInsert.reduce((sum, inv) => sum + inv.TotalAmount, 0);

    return new Response(
      JSON.stringify({
        success: true,
        count: invoicesToInsert.length,
        totalRevenue: totalRevenue,
        monthYear: monthYear,
        societyId: societyId
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
