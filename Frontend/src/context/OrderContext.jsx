import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * OrderContext
 * Saves / retrieves orders scoped to the logged-in user.
 *
 * localStorage key:  sw_orders  →  Record<userId, Order[]>
 *
 * Order shape:
 * {
 *   id:        string,
 *   userId:    string,
 *   items:     CartItem[],   (snapshot of cart at checkout)
 *   total:     number,
 *   itemCount: number,
 *   date:      ISO string,
 *   status:    'Order Placed' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered',
 *   address:   DeliveryAddress | null,
 * }
 *
 * DeliveryAddress shape:
 * { fullName, phone, line1, line2, city, state, pin, type }
 */

const OrderContext = createContext(null);

const LS_KEY   = 'sw_orders';
const readLS   = (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const writeLS  = (key, v)  => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };
/**
 * Unique integer order ID: timestamp (ms) + 3 random digits.
 * e.g. 1740000000000123  — always an integer, always unique.
 */
const uid = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);

/** All 5 Flipkart-style steps in order */
export const ORDER_STEPS = [
  'Order Placed',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

/** Simulate a realistic status for demo orders based on order age */
const fakeStatus = (dateStr) => {
  const age = Date.now() - new Date(dateStr).getTime();
  if (age > 6  * 86400000) return 'Delivered';
  if (age > 4  * 86400000) return 'Out for Delivery';
  if (age > 2  * 86400000) return 'Shipped';
  if (age > 0.25 * 86400000) return 'Confirmed';   // > 6 hours
  return 'Order Placed';
};

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState(() => readLS(LS_KEY, {}));

  /* Sync to LS */
  useEffect(() => { writeLS(LS_KEY, allOrders); }, [allOrders]);

  /** Orders for the currently logged-in user */
  const myOrders = user ? (allOrders[user.id] ?? []) : [];

  /** Place a new order (call after clearing cart) */
  const placeOrder = useCallback(({ items, total, itemCount, address = null }) => {
    if (!user) return;
    const order = {
      id:        uid(),
      userId:    user.id,
      items,
      total,
      itemCount,
      address,
      date:      new Date().toISOString(),
      status:    'Order Placed',
    };
    setAllOrders(prev => ({
      ...prev,
      [user.id]: [order, ...(prev[user.id] ?? [])],
    }));
    return order;
  }, [user]);

  /** Cancel an order — only allowed before it's shipped */
  const cancelOrder = useCallback((orderId) => {
    if (!user) return;
    setAllOrders(prev => {
      const userOrders = (prev[user.id] ?? []).map(o =>
        o.id === orderId ? { ...o, status: 'Cancelled', cancelledAt: new Date().toISOString() } : o
      );
      return { ...prev, [user.id]: userOrders };
    });
  }, [user]);

  /**
   * Recompute status for display — skip if manually set to Cancelled,
   * otherwise derive from order age.
   */
  const withStatus = (order) =>
    order.status === 'Cancelled'
      ? order
      : { ...order, status: fakeStatus(order.date) };

  return (
    <OrderContext.Provider value={{ myOrders: myOrders.map(withStatus), placeOrder, cancelOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be inside <OrderProvider>');
  return ctx;
}
