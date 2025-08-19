import React from "react";
import { Order } from "../../types/types";
import { useProductStore } from "@/app/store/productStore";

interface OrderItemsProps {
  order: Order;
}

const OrderItems: React.FC<OrderItemsProps> = ({ order }) => {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const { products } = useProductStore();
  console.log(products);
  const isPrescriptionRequired = (productId: Number) => {
    const product = products.find((p) => Number(p.id) === productId);
    console.log(product);
    return product?.prescriptionRequired || false;
  };

  return (
    <div className="space-y-20 h-80">
      <div>
        <div className="bg-white p-4 rounded-lg border border-gray-300">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Order Items
          </h3>
          <div className="grid grid-cols-5 gap-4 py-4 text-gray-700 text-xs">
            <div className="text-xs">Product Name</div>
            <div className="text-right text-xs">Price</div>
            <div className="text-center text-xs">Quantity</div>
            <div className="text-right text-xs">Total</div>
            <div className="text-center text-xs">Prescription</div>
          </div>
          {order.items.map((item) => {
            const requiresPrescription = isPrescriptionRequired(
              Number(item.productId)
            );

            return (
              <div
                key={item.orderItemId}
                className="grid grid-cols-5 gap-4 py-4 border-t border-gray-100 hover:bg-gray-50"
              >
                <div>
                  <h4 className="text-xs text-gray-700">
                    {item.productName || `Product ID: ${item.productId}`}
                  </h4>
                  {item.sku && (
                    <p className="text-gray-500 text-[10px]">
                      ID: {item.productId}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-700">
                  {formatCurrency(parseFloat(item.sellingPrice))}
                </div>
                <div className="text-center text-xs text-gray-600">
                  {item.quantity}
                </div>
                <div className="text-right text-xs text-gray-700">
                  {formatCurrency(
                    parseFloat(item.sellingPrice) * item.quantity
                  )}
                </div>
                <div className="text-center">
                  <span
                    className={`px-2 py-1 rounded text-[10px] ${
                      requiresPrescription
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {requiresPrescription ? "Rx Required" : "Not Required"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderItems;
