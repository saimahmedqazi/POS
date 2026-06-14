import SaleInvoiceBill from './sale-invoice-bill';
import { useEffect, useState } from 'react';
import { getDatabase } from '../lib/database';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

type Props = {
  open: boolean;
  saleId?: string;
  items: CartItem[];
  total: number;
  customerName?: string;
  onClose: () => void;
};

export default function ReceiptModal({
  open,
  saleId,
  items,
  total,
  customerName,
  onClose,
}: Props) {
  const [businessName, setBusinessName] = useState('CybSOC POS');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const db = getDatabase();
        const rows = await db.select<{ value: string }[]>(
          "SELECT value FROM app_settings WHERE key = 'business_name'"
        );
        if (rows.length > 0 && rows[0].value) {
          setBusinessName(rows[0].value);
        }
      } catch (_) {
        // silently fall back to default
      }
    })();
  }, [open]);

  if (!open) {
    return null;
  }

  const invoiceNo = saleId
    ? `INV-${saleId.slice(0, 8).toUpperCase()}`
    : `INV-${Date.now()}`;

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
    .replace(/ /g, '-')
    .toUpperCase();

  return (
    <>
      {/* Print CSS — hides the modal chrome, only shows the invoice */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .pos-print-target { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-surface/95 backdrop-blur-lg border border-border text-foreground rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Receipt</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="border-b border-border pb-4 mb-4">
            <h3 className="font-semibold text-lg">{businessName}</h3>
            <p className="text-sm text-muted-foreground">Transaction Receipt</p>
            {customerName && (
              <p className="text-sm text-muted-foreground mt-1">Customer: {customerName}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleString()}
            </p>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × Rs. {item.price}
                  </p>
                </div>
                <p className="font-semibold">
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-6 pt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-primary">Rs. {total.toFixed(2)}</span>
          </div>

          <div className="mt-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Powered by CybSOC
          </div>

          <div className="flex flex-col gap-3 mt-8 no-print">
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-surface border border-border hover:bg-surface-hover text-foreground py-3 rounded-xl transition-colors font-medium text-sm"
              >
                Standard Print
              </button>

              <button
                onClick={() => {
                  alert('Thermal printing requires ESC/POS integration (e.g. via Tauri Serial/USB plugin).');
                }}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary/90 transition-all font-medium text-sm shadow-sm shadow-primary/20"
              >
                Thermal Print
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white py-3 rounded-xl transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Print-only invoice — visible only when window.print() fires */}
      <div className="pos-print-target" style={{ display: 'none' }}>
        <SaleInvoiceBill
          data={{
            invoiceNo,
            date: today,
            serialNo: saleId ? saleId.slice(-6).toUpperCase() : '—',
            businessName,
            customerName,
            items: items.map((i) => ({
              id: i.productId,
              code: i.productId.slice(0, 5).toUpperCase(),
              description: i.name,
              quantity: i.quantity,
              rate: i.price,
              discount: 0,
              total: i.price * i.quantity,
            })),
            totalQuantity: items.reduce((acc, i) => acc + i.quantity, 0),
            totalAmount: total,
            transportation: 0,
            grandTotal: total,
          }}
        />
      </div>
    </>
  );
}