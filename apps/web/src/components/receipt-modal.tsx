type CartItem = {
  productId: string;

  name: string;

  price: number;

  quantity: number;

  stock: number;
};

type Props = {
  open: boolean;

  items: CartItem[];

  total: number;

  onClose: () => void;
};

export default function ReceiptModal({
  open,
  items,
  total,
  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface/95 backdrop-blur-lg border border-border text-foreground rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Receipt
          </h2>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="border-b border-border pb-4 mb-4">
          <h3 className="font-semibold text-lg">
            POS ERP Store
          </h3>

          <p className="text-sm text-muted-foreground">
            Transaction Receipt
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleString()}
          </p>
        </div>

        <div className="space-y-3">
          {items.map(
            (item) => (
              <div
                key={
                  item.productId
                }
                className="flex justify-between"
              >
                <div>
                  <p className="font-medium">
                    {item.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.quantity} × Rs.{' '}
                    {item.price}
                  </p>
                </div>

                <p className="font-semibold">
                  Rs.{' '}
                  {item.price *
                    item.quantity}
                </p>
              </div>
            ),
          )}
        </div>

        <div className="border-t border-border mt-6 pt-4 flex justify-between text-xl font-bold">
          <span>Total</span>
          <span className="text-primary">Rs. {total}</span>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-surface border border-border hover:bg-surface-hover text-foreground py-3 rounded-xl transition-colors font-medium text-sm"
            >
              Standard Print
            </button>
            
            <button
              onClick={() => {
                // TODO: Integrate ESC/POS commands for Thermal Printers
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
  );
}