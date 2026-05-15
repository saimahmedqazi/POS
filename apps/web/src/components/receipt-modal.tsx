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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Receipt
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500"
          >
            ×
          </button>
        </div>

        <div className="border-b pb-4 mb-4">
          <h3 className="font-semibold text-lg">
            POS ERP Store
          </h3>

          <p className="text-sm text-slate-500">
            Transaction Receipt
          </p>

          <p className="text-sm text-slate-500 mt-1">
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

        <div className="border-t mt-6 pt-4 flex justify-between text-xl font-bold">
          <span>
            Total
          </span>

          <span>
            Rs. {total}
          </span>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() =>
              window.print()
            }
            className="flex-1 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800"
          >
            Print
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 py-3 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}