import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { MaintenanceInvoice, MaintenancePayment } from '../../src/types';

interface WebhookPayload {
  transaction_id: string;
  invoice_id: string;
  society_id: string;
  amount_paid: number;
  payment_mode: string;
  timestamp: string;
}

interface WebhookResponse {
  statusCode: number;
  status: string;
  message: string;
  processed: boolean;
}

describe('09 - Chaos & Stress: Payment Webhook Idempotency Test', () => {
  let dbStore: MockDatabaseStore;
  const processedTransactions = new Set<string>();

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
    processedTransactions.clear();
  });

  /**
   * Simulated Edge Function Handler (`supabase/functions/payment-webhook`)
   * Implements strict idempotency checking using transaction_id lookup.
   */
  async function handlePaymentWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
    const { transaction_id, invoice_id, society_id, amount_paid, payment_mode, timestamp } = payload;

    // 1. Check idempotency log / processed transactions set
    if (processedTransactions.has(transaction_id)) {
      return {
        statusCode: 200,
        status: 'Already Processed',
        message: `Transaction ${transaction_id} was previously processed and confirmed. Ignored duplicate webhook call.`,
        processed: false
      };
    }

    // 2. Fetch invoice from database
    const invoice: MaintenanceInvoice | undefined = dbStore.invoices.get(invoice_id);
    if (!invoice) {
      return {
        statusCode: 404,
        status: 'Error',
        message: `Invoice ${invoice_id} not found`,
        processed: false
      };
    }

    // 3. Mark transaction as processed atomically
    processedTransactions.add(transaction_id);

    // 4. Update invoice status to 'Paid'
    const updatedInvoice: MaintenanceInvoice = {
      ...invoice,
      Status: 'Paid'
    };
    dbStore.invoices.set(invoice_id, updatedInvoice);

    // 5. Create payment receipt entry
    const paymentEntry: MaintenancePayment = {
      id: `pmt_${transaction_id}`,
      InvoiceId: invoice_id,
      SocietyId: society_id,
      FlatNo: invoice.FlatNo,
      AmountPaid: amount_paid,
      PaymentDate: timestamp,
      Mode: payment_mode as any,
      TransactionRef: transaction_id,
      Status: 'Success'
    };
    dbStore.payments.set(paymentEntry.id, paymentEntry);

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Payment recorded and invoice marked as Paid',
      processed: true
    };
  }

  test('Fire 3 duplicate payment confirmation webhooks with identical transaction_id & invoice_id', async () => {
    // Seed test invoice
    const invoiceId = 'inv_july_2026_a101';
    const testInvoice: MaintenanceInvoice = {
      id: invoiceId,
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      OwnerName: 'Rajesh Sharma',
      MonthYear: 'July 2026',
      TotalAmount: 3500,
      DueDate: '2026-07-15',
      Status: 'Unpaid'
    };
    dbStore.invoices.set(invoiceId, testInvoice);

    const webhookPayload: WebhookPayload = {
      transaction_id: 'tx_razorpay_9988776655',
      invoice_id: invoiceId,
      society_id: MOCK_SOCIETY_A.id,
      amount_paid: 3500,
      payment_mode: 'UPI',
      timestamp: '2026-07-24T10:00:00Z'
    };

    // Fire Webhook 1 (First attempt)
    const response1 = await handlePaymentWebhook(webhookPayload);
    expect(response1.statusCode).toBe(200);
    expect(response1.status).toBe('Success');
    expect(response1.processed).toBe(true);

    // Fire Webhook 2 (Duplicate 1)
    const response2 = await handlePaymentWebhook(webhookPayload);
    expect(response2.statusCode).toBe(200);
    expect(response2.status).toBe('Already Processed');
    expect(response2.processed).toBe(false);

    // Fire Webhook 3 (Duplicate 2)
    const response3 = await handlePaymentWebhook(webhookPayload);
    expect(response3.statusCode).toBe(200);
    expect(response3.status).toBe('Already Processed');
    expect(response3.processed).toBe(false);

    // Assert Invoice status is 'Paid'
    const finalInvoice = dbStore.invoices.get(invoiceId);
    expect(finalInvoice.Status).toBe('Paid');

    // Assert EXACTLY 1 payment entry created in database
    const createdPayments = Array.from(dbStore.payments.values()).filter(
      p => p.TransactionRef === 'tx_razorpay_9988776655'
    );
    expect(createdPayments.length).toBe(1);
  });
});
