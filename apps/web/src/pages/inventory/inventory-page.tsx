import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/client';

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

type Product = {
  id: string;

  name: string;

  sku: string;

  barcode: string;

  salePrice: number;

  costPrice: number;

  inventory?: {
    quantity: number;
  }[];
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
  ] = useState<any>(
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

  useEffect(() => {
    const fetchProducts =
      async () => {
        try {
          const response =
            await api.get(
              '/products',
            );

          setProducts(
            response.data,
          );
        } catch (
          error: any
        ) {
          console.error(
            error,
          );
        } finally {
          setLoading(false);
        }
      };

    fetchProducts();
  }, []);

  const handleCreateProduct =
    async () => {
      try {
        setCreating(true);

        const response =
          await api.post(
            '/products',
            {
              name,

              sku,

              barcode,

              salePrice:
                Number(
                  salePrice,
                ),

              costPrice:
                Number(
                  costPrice,
                ),
            },
          );

        await api.post(
          '/inventory/adjust',
          {
            productId:
              response.data.id,

            quantity:
              Number(
                quantity,
              ),

            type:
              'PURCHASE',
          },
        );

        setProducts([
          {
            ...response.data,

            inventory: [
              {
                quantity:
                  Number(
                    quantity,
                  ),
              },
            ],
          },

          ...products,
        ]);

        setName('');
        setSku('');
        setBarcode('');
        setSalePrice('');
        setCostPrice('');
        setQuantity('');

        alert(
          'Product created',
        );
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        alert(
          error.response?.data
            ?.message ||
            'Failed to create product',
        );
      } finally {
        setCreating(false);
      }
    };

  const handleUpdateProduct =
    async () => {
      try {
        const response =
          await api.patch(
            `/products/${editingProduct.id}`,
            {
              name:
                editingProduct.name,

              sku:
                editingProduct.sku,

              barcode:
                editingProduct.barcode,

              salePrice:
                Number(
                  editingProduct.salePrice,
                ),

              costPrice:
                Number(
                  editingProduct.costPrice,
                ),
            },
          );

        setProducts(
          products.map(
            (
              product,
            ) =>
              product.id ===
              editingProduct.id
                ? {
                    ...product,

                    ...response.data,
                  }
                : product,
          ),
        );

        setEditingProduct(
          null,
        );

        alert(
          'Product updated',
        );
      } catch (
        error: any
      ) {
        alert(
          error.response?.data
            ?.message ||
            'Failed to update product',
        );
      }
    };

  const handleAdjustStock =
    async () => {
      if (
        !editingProduct
      ) {
        return;
      }

      try {
        setAdjustingStock(
          true,
        );

        const quantity =
          Number(
            adjustmentQuantity,
          );

        await api.post(
          '/inventory/adjust',
          {
            productId:
              editingProduct.id,

            type:
              'ADJUSTMENT',

            quantity,
          },
        );

        setProducts(
          products.map(
            (
              product,
            ) => {
              if (
                product.id !==
                editingProduct.id
              ) {
                return product;
              }

              const currentQty =
                product
                  .inventory?.[0]
                  ?.quantity ||
                0;

              return {
                ...product,

                inventory: [
                  {
                    quantity:
                      currentQty +
                      quantity,
                  },
                ],
              };
            },
          ),
        );

        setAdjustmentQuantity(
          '',
        );

        alert(
          'Stock adjusted',
        );
      } catch (
        error: any
      ) {
        alert(
          error.response?.data
            ?.message ||
            'Failed to adjust stock',
        );
      } finally {
        setAdjustingStock(
          false,
        );
      }
    };

  const handleArchiveProduct =
    async (
      productId: string,
    ) => {
      const confirmed =
        confirm(
          'Archive this product?',
        );

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(
          `/products/${productId}`,
        );

        setProducts(
          products.filter(
            (
              product,
            ) =>
              product.id !==
              productId,
          ),
        );

        alert(
          'Product archived',
        );
      } catch (
        error: any
      ) {
        alert(
          error.response?.data
            ?.message ||
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
                    {
                      product.costPrice
                    }
                  </TableCell>

                  <TableCell>
                    Rs.{' '}
                    {
                      product.salePrice
                    }
                  </TableCell>

                  <TableCell>
                    {product
                      .inventory?.[0]
                      ?.quantity ??
                      0}
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
                          handleArchiveProduct(
                            product.id,
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
                ...editingProduct,

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
                ...editingProduct,

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
                ...editingProduct,

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
                ...editingProduct,

                salePrice:
                  e.target.value,
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
                ...editingProduct,

                costPrice:
                  e.target.value,
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
              editingProduct
                ?.inventory?.[0]
                ?.quantity
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
    </AppLayout>
  );
}