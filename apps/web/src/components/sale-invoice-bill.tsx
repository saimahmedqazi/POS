

export type InvoiceItem = {
  id: string;
  code: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
};

export type InvoiceData = {
  invoiceNo: string;
  date: string;
  serialNo: string;
  customerName?: string;
  items: InvoiceItem[];
  totalQuantity: number;
  totalAmount: number;
  transportation: number;
  grandTotal: number;
};

type Props = {
  data: InvoiceData;
};

export default function SaleInvoiceBill({ data }: Props) {
  return (
    <div className="print-only text-black bg-white" style={{ fontFamily: 'monospace', fontSize: '12px', padding: '20px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase" style={{ letterSpacing: '2px' }}>Ice Depot</h1>
        <h2 className="text-xl font-bold uppercase mt-2 border-b-2 border-black inline-block pb-1">Sale Invoice</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 font-semibold uppercase">
        <div>
          <p>PARTY NAME: {data.customerName || 'SPOT SALE'}</p>
          <p>TQ: {data.totalQuantity}</p>
          <p>TW: 1272</p>
        </div>
        <div className="text-right">
          <p>INVOICE #: {data.invoiceNo}</p>
          <p>DATE: {data.date}</p>
          <p>SERIAL #: {data.serialNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 font-semibold uppercase">
        <div>
          <p>SALESMAN: DISTRIBUTOR</p>
        </div>
        <div className="text-right">
          <p>BOOKER: DISTRIBUTOR</p>
        </div>
      </div>

      <table className="w-full mb-4 border-collapse uppercase text-sm">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="py-2 px-1 text-left">SR #</th>
            <th className="py-2 px-1 text-left">CODE</th>
            <th className="py-2 px-1 text-left">ITEM DESCRIPTION</th>
            <th className="py-2 px-1 text-right">QTY</th>
            <th className="py-2 px-1 text-right">RATE</th>
            <th className="py-2 px-1 text-right">DISCOUNT</th>
            <th className="py-2 px-1 text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={item.id} className="border-b border-black/20">
              <td className="py-2 px-1">{index + 1}</td>
              <td className="py-2 px-1">{item.code || '-'}</td>
              <td className="py-2 px-1">{item.description}</td>
              <td className="py-2 px-1 text-right">{item.quantity}</td>
              <td className="py-2 px-1 text-right">{item.rate.toFixed(2)}</td>
              <td className="py-2 px-1 text-right">{item.discount.toFixed(2)}</td>
              <td className="py-2 px-1 text-right">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="w-full flex justify-end">
        <table className="w-1/2 border-collapse uppercase font-semibold text-sm">
          <tbody>
            <tr className="border-t-2 border-black">
              <td className="py-2 px-2 text-left">&lt;&lt; TOTAL &gt;&gt;</td>
              <td className="py-2 px-2 text-right">{data.totalQuantity}</td>
              <td className="py-2 px-2 text-right">{data.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="py-2 px-2 text-left">TRANSPORTATION</td>
              <td className="py-2 px-2 text-right">{data.transportation.toFixed(2)}</td>
            </tr>
            <tr className="border-y-2 border-black text-lg">
              <td colSpan={2} className="py-2 px-2 text-left">GRAND TOTAL</td>
              <td className="py-2 px-2 text-right">{data.grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
