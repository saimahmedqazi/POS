import {
  useEffect,
  useState,
} from 'react';

import AppLayout from '../../layouts/app-layout';

import Card from '../../components/ui/card';

import Button from '../../components/ui/button';

import Input from '../../components/ui/input';

import Modal from '../../components/ui/modal';

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
} from '../../repositories/product.repository';

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
  }, []);

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

        const product =
          await createProduct({
            name:
              trimmedName,

            sku:
              trimmedSku,

            barcode:
              trimmedBarcode,

            salePrice:
              parsedSalePrice,

            costPrice:
              parsedCostPrice,

            quantity:
              parsedQuantity,
          });

        setProducts([
          product as Product,

          ...products,
        ]);

        resetCreateForm();

        setSuccessMessage(
          'Product created successfully',
        );
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

        const updated =
          await updateProduct({
            ...editingProduct,

            name:
              trimmedName,

            sku:
              trimmedSku,

            barcode:
              trimmedBarcode,

            salePrice:
              parsedSalePrice,

            costPrice:
              parsedCostPrice,
          });

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
        <div>
          Loading inventory...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <PageHeader
          title="Inventory"
          subtitle="Product stock management"
        />

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <div className="flex items-center justify-between">
              <span>
                {errorMessage}
              </span>

              <button
                onClick={() =>
                  setErrorMessage(
                    '',
                  )
                }
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <div className="flex items-center justify-between">
              <span>
                {
                  successMessage
                }
              </span>

              <button
                onClick={() =>
                  setSuccessMessage(
                    '',
                  )
                }
                className="text-green-500 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Add Product
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value,
                )
              }
            />

            <Input
              type="text"
              placeholder="SKU"
              value={sku}
              onChange={(e) =>
                setSku(
                  e.target.value,
                )
              }
            />

            <Input
              type="text"
              placeholder="Barcode"
              value={barcode}
              onChange={(e) =>
                setBarcode(
                  e.target.value,
                )
              }
            />

            <Input
              type="number"
              placeholder="Cost Price"
              value={costPrice}
              onChange={(e) =>
                setCostPrice(
                  e.target.value,
                )
              }
            />

            <Input
              type="number"
              placeholder="Sale Price"
              value={salePrice}
              onChange={(e) =>
                setSalePrice(
                  e.target.value,
                )
              }
            />

            <Input
              type="number"
              placeholder="Opening Quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value,
                )
              }
            />
          </div>

          <Button
            onClick={
              handleCreateProduct
            }
            disabled={creating}
            className="mt-4"
          >
            {creating
              ? 'Creating...'
              : 'Create Product'}
          </Button>
        </Card>

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
                        product.quantity <=
                        5
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
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

        <div className="border-t pt-4 mt-6">
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
          >
            Save Changes
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
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
            <h3 className="font-semibold text-red-700 mb-2">
              Confirm Archive
            </h3>

            <div className="space-y-1 text-sm text-slate-700">
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
    </AppLayout>
  );
}