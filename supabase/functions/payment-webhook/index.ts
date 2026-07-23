// Supabase Edge Function to auto-reconcile payments
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const body = await req.json()
  const event = body.event

  // Verify payment success payload from Gateway
  if (event === 'payment.captured') {
    const payment = body.payload.payment.entity
    const invoiceId = payment.notes.invoice_id
    const transactionId = payment.id

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Update Invoice status to 'Paid'
    await supabase
      .from('Invoices')
      .update({ Status: 'Paid' })
      .eq('id', invoiceId)

    // 2. Insert into Payments ledger
    await supabase
      .from('Payments')
      .insert({
        InvoiceId: invoiceId,
        TransactionHash: transactionId,
        Amount: payment.amount / 100,
        PaymentMode: 'UPI',
        Status: 'Approved'
      })
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})