export interface OrderModel {
  billingName: string;
  billingCUI: string;
  billingAddress: string;
  deliveryAddress: string;
  contactName: string;
  contactPhone: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  total: number;
}
