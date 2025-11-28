import { create } from "zustand";
import { CreateOrderItem, OrderItem, Product } from "../types/types";

interface CustomerInfo {
  customerId: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  gender: string;
}

interface ShippingInfo {
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface OrderState {
  customerInfo: CustomerInfo;
  shippingInfo: ShippingInfo;
  prescriptionUrls: string[];
  orderItems: CreateOrderItem[];
  paymentMethod: string;
  prescriptionItems: boolean;
  validationErrors: {
    customer: string[];
    shipping: string[];
    items: string[];
  };
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  updateShippingInfo: (info: Partial<ShippingInfo>) => void;
  updatePrescriptionUrls: (urls: string[]) => void;
  updateOrderItems: (items: CreateOrderItem[]) => void;
  updatePaymentMethod: (method: string) => void;
  updatePrescriptionItems: (value: boolean) => void;
  validateCurrentTab: (tab: "customer" | "shipping" | "items") => boolean;
  getValidationErrors: (tab: "customer" | "shipping" | "items") => string[];
  resetOrder: () => void;
  getOrderData: () => any;
}

const initialCustomerInfo: CustomerInfo = {
  customerId: "",
  name: "",
  age: "",
  phone: "",
  email: "",
  gender: "",
};

const initialShippingInfo: ShippingInfo = {
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export const useOrderStore = create<OrderState>((set, get) => ({
  customerInfo: initialCustomerInfo,
  shippingInfo: initialShippingInfo,
  prescriptionUrls: [],
  orderItems: [],
  paymentMethod: "",
  prescriptionItems: false,
  validationErrors: {
    customer: [],
    shipping: [],
    items: [],
  },

  updateCustomerInfo: (info) =>
    set((state) => ({
      customerInfo: { ...state.customerInfo, ...info },
    })),

  updateShippingInfo: (info) =>
    set((state) => ({
      shippingInfo: { ...state.shippingInfo, ...info },
    })),

  updatePrescriptionUrls: (urls) =>
    set(() => ({
      prescriptionUrls: urls,
    })),

  updateOrderItems: (items) =>
    set(() => ({
      orderItems: items,
    })),

  updatePaymentMethod: (method) =>
    set(() => ({
      paymentMethod: method,
    })),

  updatePrescriptionItems: (value) =>
    set(() => ({
      prescriptionItems: value,
    })),

  validateCurrentTab: (tab) => {
    const state = get();
    let errors: string[] = [];

    if (tab === "customer") {
      const { customerId, name, age, phone, gender } = state.customerInfo;

      if (!customerId.trim()) errors.push("Customer ID is required");
      if (!name.trim()) errors.push("Customer name is required");
      if (!age.trim()) errors.push("Age is required");
      if (!phone.trim()) errors.push("Phone number is required");
      if (!gender.trim()) errors.push("Gender is required");

      if (phone.trim() && !/^\d{10}$/.test(phone.trim())) {
        errors.push("Phone number must be 10 digits");
      }

      if (
        age.trim() &&
        (!/^\d+$/.test(age.trim()) || parseInt(age) < 1 || parseInt(age) > 120)
      ) {
        errors.push("Age must be a valid number between 1 and 120");
      }
    } else if (tab === "shipping") {
      const {
        addressLine1,
        city,
        state: shippingState,
        pincode,
      } = state.shippingInfo;

      if (!addressLine1.trim()) errors.push("Address line 1 is required");
      if (!city.trim()) errors.push("City is required");
      if (!shippingState.trim()) errors.push("State is required");
      if (!pincode.trim()) errors.push("PIN code is required");

      if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
        errors.push("PIN code must be 6 digits");
      }
    } else if (tab === "items") {
      if (state.orderItems.length === 0) {
        errors.push("At least one order item is required");
      }

      state.orderItems.forEach((item, index) => {
        if (!item.quantity || item.quantity < 1) {
          errors.push(`Item ${index + 1}: Quantity must be at least 1`);
        }
        if (!item.sellingPrice || item.sellingPrice <= 0) {
          errors.push(
            `Item ${index + 1}: Selling price must be greater than 0`
          );
        }
      });
    }

    set((state) => ({
      validationErrors: {
        ...state.validationErrors,
        [tab]: errors,
      },
    }));

    return errors.length === 0;
  },

  getValidationErrors: (tab) => {
    return get().validationErrors[tab];
  },

  resetOrder: () =>
    set(() => ({
      customerInfo: initialCustomerInfo,
      shippingInfo: initialShippingInfo,
      prescriptionUrls: [],
      orderItems: [],
      paymentMethod: "",
      prescriptionItems: false,
      validationErrors: {
        customer: [],
        shipping: [],
        items: [],
      },
    })),

  getOrderData: () => {
    const state = get();
    const subtotal = state.orderItems.reduce<number>(
      (total, item) =>
        total + Number(item.sellingPrice) * Number(item.quantity),
      0
    );
    const deliveryCharge = subtotal < 499 ? 40 : 0;
    const handlingPackagingFee = 5;
    const total = subtotal + deliveryCharge + handlingPackagingFee;

    return {
      order_items: state.orderItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        sku: item.sku,
        tax: 0,
        discount: 0,
        hsn: 0,
        productLength: 10,
        productBreadth: 5,
        productHeight: 3,
        productWeight: 0.5,
      })),
    };
  },
}));
