import {
  useEffect,
  useState,
} from 'react';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Input from '../../components/ui/input';

import Modal from '../../components/ui/modal';

import Toast from '../../components/ui/toast';

import PageHeader from '../../components/ui/page-header';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/ui/table';

import {
  getProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  adjustProductStock,
  getInventoryTransactions,
} from '../../repositories/product.repository';


import {
  syncProductsToCloud,
} from '../../services/product-sync.service';

type Product = {
  id: string;

  name: string;

  sku: string;

  barcode: string;

  salePrice: number;

  costPrice: number;

  quantity: number;
};

export default function InventoryPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [name, setName] =
    useState('');

  const [sku, setSku] =
    useState('');

  const [barcode, setBarcode] =
    useState('');

  const [
    salePrice,
    setSalePrice,
  ] = useState('');

  const [
    costPrice,
    setCostPrice,
  ] = useState('');

  const [
    quantity,
    setQuantity,
  ] = useState('');

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(
    null,
  );

  const [
    adjustmentQuantity,
    setAdjustmentQuantity,
  ] = useState('');

  const [
    adjustingStock,
    setAdjustingStock,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    archiveTarget,
    setArchiveTarget,
  ] = useState<Product | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'history'>('products');

  const [
  syncingProducts,
  setSyncingProducts,
] = useState(false);

  const [
  inventoryTransactions,
  setInventoryTransactions,
] = useState<any[]>(
  [],
);

  const loadProducts =
    async () => {
      try {
        const localProducts =
          await getProducts();

        setProducts(
          (
            localProducts as any[]
          ).map(
            (
              product: any,
            ) => ({
              id: product.id,

              name:
                product.name,

              sku:
                product.sku ||
                '',

              barcode:
                product.barcode ||
                '',

              salePrice:
                Number(
                  product.sale_price ||
                    0,
                ),

              costPrice:
                Number(
                  product.cost_price ||
                    0,
                ),

              quantity:
                Number(
                  product.quantity ||
                    0,
                ),
            }),
          ),
        );
        
        const transactions =
  await getInventoryTransactions();

setInventoryTransactions(
  transactions as any[],
);
      } catch (
        error
      ) {
        console.error(
          'Failed loading products',
          error,
        );

        setErrorMessage(
          'Failed loading inventory',
        );
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    loadProducts();
    
  }, []
);


  const resetCreateForm =
    () => {
      setName('');
      setSku('');
      setBarcode('');
      setSalePrice('');
      setCostPrice('');
      setQuantity('');
    };

  const handleCreateProduct =
    async () => {
      if (creating) {
        return;
      }

      const trimmedName =
        name.trim();

      const trimmedSku =
        sku.trim();

      const trimmedBarcode =
        barcode.trim();

      const parsedSalePrice =
        Number(salePrice);

      const parsedCostPrice =
        Number(costPrice);

      const parsedQuantity =
        Math.floor(
          Number(quantity),
        );

      if (!trimmedName) {
        setErrorMessage(
          'Product name required',
        );

        return;
      }

      if (
        !Number.isFinite(
          parsedSalePrice,
        ) ||
        parsedSalePrice < 0
      ) {
        setErrorMessage(
          'Invalid sale price',
        );

        return;
      }

      if (
        !Number.isFinite(
          parsedCostPrice,
        ) ||
        parsedCostPrice < 0
      ) {
        setErrorMessage(
          'Invalid cost price',
        );

        return;
      }

      if (
        !Number.isFinite(
          parsedQuantity,
        ) ||
        parsedQuantity < 0
      ) {
        setErrorMessage(
          'Invalid quantity',
        );

        return;
      }

      try {
        setCreating(true);

        await createProduct({
          name: trimmedName,
          sku: trimmedSku,
          barcode: trimmedBarcode,
          salePrice: parsedSalePrice,
          costPrice: parsedCostPrice,
          quantity: parsedQuantity,
        });

        await loadProducts();
        
        const latestProducts =
          await getProducts();

        try {
          await syncProductsToCloud(
            latestProducts as any[],
          );
        } catch (syncError) {
          console.warn('Background sync failed', syncError);
        }

        resetCreateForm();

        setSuccessMessage(
          'Product created successfully',
        );
        setIsAddModalOpen(false);
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          error.message ||
            'Failed to create product',
        );
      } finally {
        setCreating(false);
      }
    };

  const handleUpdateProduct =
    async () => {
      if (
        !editingProduct
      ) {
        return;
      }

      if (creating) {
        return;
      }

      const trimmedName =
        editingProduct.name.trim();

      const trimmedSku =
        editingProduct.sku.trim();

      const trimmedBarcode =
        editingProduct.barcode.trim();

      const parsedSalePrice =
        Number(
          editingProduct.salePrice,
        );

      const parsedCostPrice =
        Number(
          editingProduct.costPrice,
        );

      if (!trimmedName) {
        setErrorMessage(
          'Product name required',
        );

        return;
      }

      if (
        !Number.isFinite(
          parsedSalePrice,
        ) ||
        parsedSalePrice < 0
      ) {
        setErrorMessage(
          'Invalid sale price',
        );

        return;
      }

      if (
        !Number.isFinite(
          parsedCostPrice,
        ) ||
        parsedCostPrice < 0
      ) {
        setErrorMessage(
          'Invalid cost price',
        );

        return;
      }

      try {
        setCreating(true);

        await updateProduct({
          ...editingProduct,
          name: trimmedName,
          sku: trimmedSku,
          barcode: trimmedBarcode,
          salePrice: parsedSalePrice,
          costPrice: parsedCostPrice,
        });

        await loadProducts();
        
        const latestProducts =
          await getProducts();

try {
  await syncProductsToCloud(
    latestProducts as any[],
  );
} catch (syncError) {
  console.warn('Background sync failed', syncError);
}

setEditingProduct(
  null,
);

setSuccessMessage(
  'Product updated successfully',
);
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          error.message ||
            'Failed to update product',
        );
      } finally {
        setCreating(false);
      }
    };

  const handleAdjustStock =
    async () => {
      if (
        !editingProduct
      ) {
        return;
      }

      if (
        adjustingStock
      ) {
        return;
      }

      const adjustment =
        Math.floor(
          Number(
            adjustmentQuantity,
          ),
        );

      if (
        !Number.isFinite(
          adjustment,
        )
      ) {
        setErrorMessage(
          'Invalid adjustment quantity',
        );

        return;
      }

      if (
        adjustment === 0
      ) {
        setErrorMessage(
          'Adjustment cannot be zero',
        );

        return;
      }

      if (
        Math.abs(
          adjustment,
        ) > 100000
      ) {
        setErrorMessage(
          'Adjustment too large',
        );

        return;
      }

      const futureQuantity =
        editingProduct.quantity +
        adjustment;

      if (
        futureQuantity < 0
      ) {
        setErrorMessage(
          'Insufficient stock',
        );

        return;
      }

      try {
        setAdjustingStock(
          true,
        );

        const updated =
          await adjustProductStock(
            editingProduct.id,
            adjustment,
          );

       setProducts(
  products.map(
    (
      product,
    ) =>
      product.id ===
      editingProduct.id
        ? (updated as Product)
        : product,
  ),
);

const latestProducts =
  await getProducts();

try {
  await syncProductsToCloud(
    latestProducts as any[],
  );
} catch (syncError) {
  console.warn('Background sync failed', syncError);
}

const transactions =
  await getInventoryTransactions();

setInventoryTransactions(
  transactions as any[],
);

setEditingProduct({
  ...editingProduct,

  quantity:
    (
      updated as any
    ).quantity,
});

        setAdjustmentQuantity(
          '',
        );

        setSuccessMessage(
          'Stock adjusted successfully',
        );
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          error.message ||
            'Failed to adjust stock',
        );
      } finally {
        setAdjustingStock(
          false,
        );
      }
    };

  const confirmArchiveProduct =
    async () => {
      if (!archiveTarget) {
        return;
      }

      try {
        await archiveProduct(
          archiveTarget.id,
        );

        setProducts(
          products.filter(
            (
              product,
            ) =>
              product.id !==
              archiveTarget.id,
          ),
        );
        const latestProducts =
          await getProducts();

        try {
          await syncProductsToCloud(
            latestProducts as any[],
          );
        } catch (syncError) {
          console.warn('Background sync failed', syncError);
        }

        setSuccessMessage(
          'Product archived successfully',
        );

        setArchiveTarget(
          null,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErrorMessage(
          'Failed to archive product',
        );
      }
    };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-foreground/70 text-lg font-medium animate-pulse">
            Loading inventory...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <PageHeader
            title="Inventory"
            subtitle="Product stock management"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={syncingProducts || creating}
              onClick={async () => {
                try {
                  setSyncingProducts(true)
                  setErrorMessage('');
                  setSuccessMessage('');
                  await syncProductsToCloud(products);
                  setSuccessMessage('Products synced successfully');
                } catch (error: any) {
                  console.error(error);
                  setErrorMessage(error.message || 'Failed syncing products');
                } finally {
                  setSyncingProducts(false)
                }
              }}
            >
              {syncingProducts ? 'Syncing...' : 'Sync Products'}
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Product
            </Button>
          </div>
        </div>

        <Toast message={errorMessage} variant="error" onClose={() => setErrorMessage('')} />
        <Toast message={successMessage} variant="success" onClose={() => setSuccessMessage('')} />

        <div className="flex gap-4 mb-4 border-b border-border pb-px">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'products' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Products</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Inventory History</button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col pb-6">
          {activeTab === 'products' && (

          <Card className="flex-1 flex flex-col p-0 overflow-hidden border border-border">
            <div className="flex-1 overflow-y-auto">
              <Table>
          <TableHead>
            <tr>
              <th className="text-left p-4">
                Product
              </th>

              <th className="text-left p-4">
                SKU
              </th>

              <th className="text-left p-4">
                Barcode
              </th>

              <th className="text-left p-4">
                Cost
              </th>

              <th className="text-left p-4">
                Sale
              </th>

              <th className="text-left p-4">
                Stock
              </th>

              <th className="p-4">
                Actions
              </th>
            </tr>
          </TableHead>

          <TableBody>
            {products.map(
              (
                product,
              ) => (
                <TableRow
                  key={
                    product.id
                  }
                >
                  <TableCell>
                    {
                      product.name
                    }
                  </TableCell>

                  <TableCell>
                    {
                      product.sku
                    }
                  </TableCell>

                  <TableCell>
                    {
                      product.barcode
                    }
                  </TableCell>

                  <TableCell>
                    Rs.{' '}
                    {Number(
                      product.costPrice,
                    ).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    Rs.{' '}
                    {Number(
                      product.salePrice,
                    ).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        product.quantity !== undefined
                          ? product.quantity <= 5
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {
                        product.quantity
                      }
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="px-3 py-2"
                        onClick={() =>
                          setEditingProduct(
                            product,
                          )
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        className="px-3 py-2"
                        onClick={() =>
                          setArchiveTarget(
                            product,
                          )
                        }
                      >
                        Archive
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
            </div>
          </Card>
          )}

          {activeTab === 'history' && (
          <Card className="flex-1 flex flex-col p-0 overflow-hidden border border-border"> 
  <div className="flex items-center justify-between mb-6 p-6 pb-0">
    <div>
      <h2 className="text-2xl font-bold">
        Inventory History
      </h2>

      <p className="text-muted-foreground mt-1">
        Recent stock movements
      </p>
    </div>
  </div>

  <div className="flex-1 overflow-y-auto p-6 pt-2">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left py-3 px-2">
            Product
          </th>

          <th className="text-left py-3 px-2">
            Type
          </th>

          <th className="text-left py-3 px-2">
            Quantity
          </th>

          <th className="text-left py-3 px-2">
            Notes
          </th>

          <th className="text-left py-3 px-2">
            Date
          </th>
        </tr>
      </thead>

      <tbody>
        {inventoryTransactions.map(
          (
            transaction,
          ) => (
            <tr
              key={
                transaction.id
              }
              className="border-b border-border/50"
            >
              <td className="py-3 px-2 font-medium">
                {
                  transaction.product_name
                }
              </td>

              <td className="py-3 px-2">
                {
                  transaction.type
                }
              </td>

              <td className="py-3 px-2">
                {
                  transaction.quantity_change
                }
              </td>

              <td className="py-3 px-2 text-muted-foreground">
                {
                  transaction.notes
                }
              </td>

              <td className="py-3 px-2 text-muted-foreground text-sm">
                {new Date(
                  transaction.created_at,
                ).toLocaleString()}
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  </div>
</Card>
          )}
      </div>
      </div>

      <Modal
        open={
          !!editingProduct
        }
        title="Edit Product"
        onClose={() =>
          setEditingProduct(
            null,
          )
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Product Name</label>
            <Input
              type="text"
              value={
                editingProduct?.name ||
                ''
              }
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct!,

                  name:
                    e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">SKU</label>
            <Input
              type="text"
              value={
                editingProduct?.sku ||
                ''
              }
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct!,

                  sku:
                    e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Barcode</label>
            <Input
              type="text"
              value={
                editingProduct?.barcode ||
                ''
              }
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct!,

                  barcode:
                    e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Sale Price</label>
            <Input
              type="number"
              value={
                editingProduct?.salePrice ||
                ''
              }
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct!,

                  salePrice:
                    Number(
                      e.target.value,
                    ),
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Cost Price</label>
            <Input
              type="number"
              value={
                editingProduct?.costPrice ||
                ''
              }
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct!,

                  costPrice:
                    Number(
                      e.target.value,
                    ),
                })
              }
            />
          </div>
        </div>

        <div className="border-t border-border pt-4 mt-6">
          <h3 className="font-semibold mb-2">
            Stock Adjustment
          </h3>

          <p className="text-sm text-slate-500 mb-3">
            Current Stock:{' '}
            {
              editingProduct?.quantity
            }
          </p>

          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Adjustment (+/-)"
              value={
                adjustmentQuantity
              }
              onChange={(e) =>
                setAdjustmentQuantity(
                  e.target.value,
                )
              }
            />

            <Button
              variant="secondary"
              onClick={
                handleAdjustStock
              }
              disabled={
                adjustingStock
              }
            >
              {adjustingStock
                ? 'Adjusting...'
                : 'Adjust'}
            </Button>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Use positive values
            to add stock and
            negative values to
            reduce stock.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() =>
              setEditingProduct(
                null,
              )
            }
          >
            Cancel
          </Button>

        <Button
  onClick={
    handleUpdateProduct
  }
  disabled={
    creating
  }
>
            {creating
  ? 'Saving...'
  : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!archiveTarget}
        title="Archive Product"
        onClose={() =>
          setArchiveTarget(
            null,
          )
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
              Confirm Archive
            </h3>

            <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <strong>
                  Product:
                </strong>{' '}
                {
                  archiveTarget?.name
                }
              </p>

              <p>
                <strong>
                  SKU:
                </strong>{' '}
                {archiveTarget?.sku ||
                  '-'}
              </p>

              <p>
                <strong>
                  Barcode:
                </strong>{' '}
                {archiveTarget?.barcode ||
                  '-'}
              </p>

              <p>
                <strong>
                  Stock:
                </strong>{' '}
                {
                  archiveTarget?.quantity
                }
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            This action cannot
            be undone.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setArchiveTarget(
                  null,
                )
              }
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={
                confirmArchiveProduct
              }
            >
              Archive Product
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isAddModalOpen}
        title="Add Product"
        onClose={() => setIsAddModalOpen(false)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Product Name</label>
            <Input type="text" placeholder="e.g. T-Shirt" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">SKU</label>
            <Input type="text" placeholder="e.g. TS-001" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Barcode</label>
            <Input type="text" placeholder="e.g. 123456789" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Opening Quantity</label>
            <Input type="number" placeholder="e.g. 50" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Cost Price</label>
            <Input type="number" placeholder="e.g. 1500" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Sale Price</label>
            <Input type="number" placeholder="e.g. 2500" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateProduct} disabled={creating || loading}>
            {creating ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </Modal>

    </AppLayout>
  );
}