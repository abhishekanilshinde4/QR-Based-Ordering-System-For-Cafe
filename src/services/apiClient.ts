import * as XLSX from 'xlsx';
import { Order, MenuItem, Table, AdminUser, OrderStatus, Review, WaiterCall } from '../types';

// Default authentic menu items matching the Kopargaon / Maharashtra hospitality context
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1-chai',
    name: 'Signature Masala Chai (कुल्हड चहा)',
    description: 'Slow-simmered rich tea brewed with crushed ginger, green cardamom, cinnamon, and fresh milk in an earthen clay kulhad.',
    category: 'Chai & Hot Teas',
    price: 25.0,
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'कुल्हड़ मसाला चाय',
    description_hi: 'अदरक, इलायची और दालचीनी से धीमी आंच पर पकाई गई गाढ़ी कुल्हड़ चाय।',
    name_mr: 'स्पेशल कुल्हड मसाला चहा',
    description_mr: 'आले, वेलची आणि दालचिनी घालून मातीच्या कुल्हडमध्ये दिलेला गरमागरम स्पेशल चहा.'
  },
  {
    id: 'm2-misal',
    name: 'Kolhapuri Special Misal Pav',
    description: 'Fiery spiced sprouted moth bean curry topped with crunchy farsan, diced onions, lemon, and 2 fresh butter-toasted pav.',
    category: 'Buns & Snacks',
    price: 80.0,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'कोल्हापुरी स्पेशल मिसल पाव',
    description_hi: 'मटकी की तीखी रस्सेदार मिसल, फरसाण, प्याज, नींबू और बटर पाव के साथ।',
    name_mr: 'कोल्हापुरी झणझणीत मिसळ पाव',
    description_mr: 'मटकीची झणझणीत उसळ, कुरकुरीत फरसाण, बारीक कांदा आणि बटर लावलेले २ ताजे पाव.'
  },
  {
    id: 'm3-vada-pav',
    name: 'Crispy Batata Vada Pav (2 Pcs)',
    description: 'Golden spiced potato fritters served inside fluffy ladi pav with spicy dry garlic chutney and fresh mint dip.',
    category: 'Buns & Snacks',
    price: 40.0,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'गरमागरम वड़ा पाव (२ पीस)',
    description_hi: 'कुरकुरे आलू वड़े, लहसुन की सूखी चटनी और तीखी हरी चटनी के साथ ताजा पाव।',
    name_mr: 'गरमागरम बटाटा वडा पाव (२ नग)',
    description_mr: 'खमंग बटाटा वडा, झणझणीत लसूण चटणी आणि हिरवी मिरची सोबत ताजे लादी पाव.'
  },
  {
    id: 'm4-poha',
    name: 'Maharashtra Kanda Poha',
    description: 'Flattened rice tossed with roasted peanuts, curry leaves, mustard seeds, turmeric, and freshly grated coconut.',
    category: 'Buns & Snacks',
    price: 45.0,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'कांदा पोहा',
    description_hi: 'मूंगफली, कढ़ी पत्ता, राई और ताजे नारियल के साथ हल्का-फुल्का पौष्टिक नाश्ता।',
    name_mr: 'खमंग कांदा पोहे',
    description_mr: 'भाजलेले शेंगदाणे, कढीपत्ता, मोहरी, हळद आणि ओल्या खोबऱ्यासह बनवलेले चवदार पोहे.'
  },
  {
    id: 'm5-pav-bhaji',
    name: 'Butter Pav Bhaji (Special)',
    description: 'Mashed spiced seasonal vegetable curry slow-simmered with aromatic pav bhaji masala, loaded with Amul butter.',
    category: 'Meals & Mains',
    price: 120.0,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'स्पेशल बटर पाव भाजी',
    description_hi: 'अमूल बटर में पकी हुई स्वादिष्ट मसालेदार पाव भाजी और बटर टोस्टेड पाव।',
    name_mr: 'स्पेशल अमूल बटर पाव भाजी',
    description_mr: 'मऊ शिजवलेल्या भाज्यांची अमूल बटरमध्ये तयार केलेली मसालेदार भाजी आणि बटर पाव.'
  },
  {
    id: 'm6-dosa',
    name: 'South Indian Butter Masala Dosa',
    description: 'Crisp golden fermented rice crepe rolled with tempered potato masala, served with piping hot dal sambar & coconut chutney.',
    category: 'Meals & Mains',
    price: 90.0,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'मक्खन मसाला डोसा',
    description_hi: 'आलू मसाला से भरा कुरकुरा डोसा, गरमागरम सांभर और नारियल चटनी के साथ।',
    name_mr: 'बटर मसाला डोसा',
    description_mr: 'कुरकुरीत सोनेरी डोसा, बटाटा भाजी, गरमागरम सांबार आणि ओल्या खोबऱ्याची चटणी.'
  },
  {
    id: 'm7-idli',
    name: 'Steamed Idli Sambar (3 Pcs)',
    description: 'Soft pillow-like steamed fermented rice cakes served with authentic spiced vegetable sambar and fresh coconut dip.',
    category: 'Meals & Mains',
    price: 60.0,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'इडली सांभर (३ पीस)',
    description_hi: 'मुलायम भाप में पकी इडली, पारंपरिक सांभर और नारियल चटनी।',
    name_mr: 'मऊ इडली सांबार (३ नग)',
    description_mr: 'लुसलुशीत वाफेवरील इडली, चवदार भाज्यांचे सांबार आणि खोबऱ्याची चटणी.'
  },
  {
    id: 'm8-paneer',
    name: 'Paneer Butter Masala with 3 Butter Roti',
    description: 'Soft cottage cheese cubes simmered in a creamy, velvety tomato cashew gravy garnished with fresh kasuri methi.',
    category: 'Meals & Mains',
    price: 180.0,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'पनीर बटर मसाला और ३ बटर रोटी',
    description_hi: 'मखमली टमाटर काजू ग्रेवी में पनीर और ३ ताज़ा बटर रोटियाँ।',
    name_mr: 'पनीर बटर मसाला आणि ३ बटर रोटी',
    description_mr: 'शाही टोमॅटो काजू ग्रेव्हीत पनीर आणि गरम बटर लावलेल्या ३ पोळ्या.'
  },
  {
    id: 'm9-coffee',
    name: 'Thick Creamy Cold Coffee with Ice Cream',
    description: 'Chilled espresso blended with rich cream, vanilla ice cream, and dark chocolate drizzle.',
    category: 'Chai & Hot Teas',
    price: 70.0,
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'आइसक्रीम कोल्ड कॉफी',
    description_hi: 'ठंडी गाढ़ी एस्प्रेसो कॉफी, वैनिला आइसक्रीम और चॉकलेट सिरप के साथ।',
    name_mr: 'आईस्क्रीम कोल्ड कॉफी',
    description_mr: 'गारगार गाढ कॉफी, व्हॅनिला आईस्क्रीम आणि चॉकलेट सिरपचे मिश्रण.'
  },
  {
    id: 'm10-gulab-jamun',
    name: 'Sizzling Hot Gulab Jamun (2 Pcs)',
    description: 'Golden fried khoya dumplings steeped in warm rose-cardamom sugar syrup, served warm.',
    category: 'Desserts & Sweets',
    price: 50.0,
    image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800',
    available: true,
    is_veg: true,
    name_hi: 'गरम गुलाब जामुन (२ पीस)',
    description_hi: 'इलायची और गुलाब जल की चाशनी में डूबे गरमागरम मावा गुलाब जामुन।',
    name_mr: 'गरम गुलाबजाम (२ नग)',
    description_mr: 'शुद्ध खव्याचे गुलाबजाम, वेलची व गुलाबाच्या पाकात भिजवलेले गरमागरम गोड पदार्थ.'
  }
];

export const DEFAULT_TABLES: Table[] = [
  { id: 't1', table_number: 1, qr_code: '/menu?table=1' },
  { id: 't2', table_number: 2, qr_code: '/menu?table=2' },
  { id: 't3', table_number: 3, qr_code: '/menu?table=3' },
  { id: 't4', table_number: 4, qr_code: '/menu?table=4' },
  { id: 't5', table_number: 5, qr_code: '/menu?table=5' },
  { id: 't6', table_number: 6, qr_code: '/menu?table=6' },
  { id: 't7', table_number: 7, qr_code: '/menu?table=7' },
  { id: 't8', table_number: 8, qr_code: '/menu?table=8' },
  { id: 't9', table_number: 9, qr_code: '/menu?table=9' },
  { id: 't10', table_number: 10, qr_code: '/menu?table=10' }
];

const STORAGE_KEYS = {
  ORDERS: 'scandine_orders_v1',
  MENU: 'scandine_menu_v1',
  TABLES: 'scandine_tables_v1',
  TOKEN: 'scandine_token',
  USER: 'scandine_user',
  REVIEWS: 'scandine_reviews_v1',
  WAITER_CALLS: 'scandine_waiter_calls_v1'
};

// =========================================================================
// Real-Time Cross-Tab / Multi-Device Synchronization
// =========================================================================
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('scandine_sync_channel');
  }
} catch {}

const eventListeners: Array<(type: string, data: any) => void> = [];

function notifySubscribers(type: string, data: any) {
  for (const listener of eventListeners) {
    try {
      listener(type, data);
    } catch {}
  }
}

function broadcastEvent(type: string, data: any) {
  if (channel) {
    try {
      channel.postMessage({ type, data, timestamp: Date.now() });
    } catch {}
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('scandine_event', { detail: { type, data } }));
  }
}

// Local Storage Helper Utilities
function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('aura_cafe_orders_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((o: any) => {
          const is_fast_order = Boolean(o.is_fast_order || o.notes?.includes('[FAST_ORDER]') || o.notes?.includes('[NO_CHANGE]'));
          return {
            ...o,
            is_fast_order,
            is_finalized: Boolean(o.is_finalized || o.notes?.includes('[FINALIZED]') || is_fast_order),
            is_modified: Boolean(o.is_modified || o.notes?.includes('[MODIFIED]'))
          };
        });
      }
    }
    return [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem('aura_cafe_orders_v2', JSON.stringify(orders));
  } catch {}
}

function getStoredMenu(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU) || localStorage.getItem('aura_cafe_menu_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_MENU_ITEMS;
}

function saveStoredMenu(items: MenuItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    localStorage.setItem('aura_cafe_menu_v2', JSON.stringify(items));
  } catch {}
}

function getStoredTables(): Table[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES) || localStorage.getItem('aura_cafe_tables_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_TABLES;
}

function saveStoredTables(tables: Table[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    localStorage.setItem('aura_cafe_tables_v2', JSON.stringify(tables));
  } catch {}
}

function getStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch {}
}

function getStoredWaiterCalls(): WaiterCall[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WAITER_CALLS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredWaiterCalls(calls: WaiterCall[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WAITER_CALLS, JSON.stringify(calls));
  } catch {}
}

export const apiClient = {
  // Subscribe to real-time events across any window or tab
  onEvent(callback: (type: string, data: any) => void): () => void {
    eventListeners.push(callback);

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        callback(event.data.type, event.data.data);
      }
    };
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.type) {
        callback(customEvent.detail.type, customEvent.detail.data);
      }
    };

    if (channel) {
      channel.addEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('scandine_event', handleCustom);
    }

    return () => {
      const idx = eventListeners.indexOf(callback);
      if (idx !== -1) eventListeners.splice(idx, 1);
      if (channel) {
        channel.removeEventListener('message', handleBroadcast);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('scandine_event', handleCustom);
      }
    };
  },

  // 1. Submit an Order (Customer)
  async placeOrder(payload: {
    table_number: number;
    notes?: string;
    customer_name?: string;
    customer_phone?: string;
    items: Array<{
      menu_id?: string;
      name: string;
      price: number;
      quantity: number;
      notes?: string;
    }>;
  }): Promise<Order> {
    const tableNum = parseInt(String(payload.table_number), 10) || 1;
    const items = payload.items || [];

    let total = 0;
    for (const it of items) {
      total += (Number(it.price) || 0) * (Number(it.quantity) || 1);
    }
    total = Math.round(total * 100) / 100;

    const localExisting = getStoredOrders();
    const highestNum = localExisting.reduce((max, o) => Math.max(max, Number(o.order_number) || 0), 1000);
    const orderNumber = highestNum + 1;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      table_number: tableNum,
      customer_name: payload.customer_name || 'Guest',
      customer_phone: payload.customer_phone || null,
      total_amount: total,
      status: 'pending',
      notes: payload.notes || null,
      completed: false,
      created_at: new Date().toISOString(),
      items: items.map((it, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        order_id: orderId,
        menu_id: it.menu_id || null,
        item_name: it.name,
        item_price: Number(it.price) || 0,
        quantity: Math.max(1, Number(it.quantity) || 1),
        notes: it.notes || null
      }))
    };

    // Save locally
    saveStoredOrders([newOrder, ...localExisting]);
    broadcastEvent('order:placed', newOrder);

    // Try backend API
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: tableNum,
          customer_name: payload.customer_name || null,
          customer_phone: payload.customer_phone || null,
          notes: payload.notes || null,
          items: items.map((i) => ({
            menu_id: i.menu_id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            notes: i.notes
          }))
        })
      });
      if (res.ok) {
        const serverOrder = await res.json();
        // Replace temporary local ID with server order
        const updated = getStoredOrders().map((o) => (o.id === newOrder.id ? serverOrder : o));
        saveStoredOrders(updated);
        return serverOrder;
      }
    } catch {}

    return newOrder;
  },

  // 2. Get All Orders (Admin)
  async getOrders(): Promise<Order[]> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    let serverOrders: Order[] = [];

    if (token) {
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            serverOrders = data;
          }
        }
      } catch {}
    }

    const localOrders = getStoredOrders();
    const orderMap = new Map<string, Order>();
    const orderNumberToId = new Map<number, string>();

    // Index local orders
    for (const o of localOrders) {
      orderMap.set(o.id, o);
      if (o.order_number) {
        orderNumberToId.set(Number(o.order_number), o.id);
      }
    }

    // Merge server orders (server is authoritative)
    for (const o of serverOrders) {
      const num = Number(o.order_number);
      // If a local temporary order exists with the same order_number, remove the temporary local duplicate
      if (num && orderNumberToId.has(num)) {
        const existingLocalId = orderNumberToId.get(num)!;
        if (existingLocalId !== o.id) {
          orderMap.delete(existingLocalId);
        }
      }

      const existing = orderMap.get(o.id);
      const is_fast_order = Boolean(
        o.is_fast_order ||
        existing?.is_fast_order ||
        o.notes?.includes('[FAST_ORDER]') ||
        o.notes?.includes('[NO_CHANGE]') ||
        existing?.notes?.includes('[FAST_ORDER]') ||
        existing?.notes?.includes('[NO_CHANGE]')
      );
      const is_finalized = Boolean(
        o.is_finalized ||
        existing?.is_finalized ||
        o.notes?.includes('[FINALIZED]') ||
        is_fast_order ||
        existing?.notes?.includes('[FINALIZED]')
      );
      const is_modified = Boolean(
        o.is_modified ||
        existing?.is_modified ||
        o.notes?.includes('[MODIFIED]') ||
        existing?.notes?.includes('[MODIFIED]')
      );
      orderMap.set(o.id, {
        ...o,
        is_fast_order,
        is_finalized,
        is_modified
      });
      if (num) {
        orderNumberToId.set(num, o.id);
      }
    }

    // Strict deduplication to ensure order_number and id are 100% unique
    const mergedList = Array.from(orderMap.values());
    const seenOrderNumbers = new Set<number>();
    const seenIds = new Set<string>();
    const deduplicatedOrders: Order[] = [];

    for (const o of mergedList) {
      if (seenIds.has(o.id)) continue;
      const num = Number(o.order_number);
      if (num && seenOrderNumbers.has(num)) continue;

      seenIds.add(o.id);
      if (num) seenOrderNumbers.add(num);
      deduplicatedOrders.push(o);
    }

    deduplicatedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    saveStoredOrders(deduplicatedOrders);
    return deduplicatedOrders;
  },

  // 2b. Customer: Track Orders & Customer Login Lookup
  async trackOrders(query: {
    phone?: string;
    order_number?: string | number;
    table?: number;
  }): Promise<{ orders: Order[]; customer: { name: string; phone: string; table_number: number } | null }> {
    const params = new URLSearchParams();
    if (query.phone) params.set('phone', String(query.phone));
    if (query.order_number) params.set('order_number', String(query.order_number));
    if (query.table) params.set('table', String(query.table));

    try {
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.orders)) {
          return data;
        }
      }
    } catch {}

    // Fallback locally
    const local = getStoredOrders();
    const cleanPhone = query.phone ? String(query.phone).replace(/\D/g, '') : null;
    const numOrder = query.order_number ? parseInt(String(query.order_number).replace(/\D/g, ''), 10) : null;
    const numTable = query.table ? Number(query.table) : null;

    const matched = local.filter((o) => {
      if (cleanPhone && o.customer_phone?.replace(/\D/g, '') === cleanPhone) return true;
      if (numOrder && o.order_number === numOrder) return true;
      if (numTable && o.table_number === numTable) return true;
      return false;
    });

    const custName = matched.find((o) => o.customer_name)?.customer_name || 'Guest Customer';
    return {
      orders: matched,
      customer: matched.length > 0 ? { name: custName, phone: cleanPhone || '', table_number: matched[0].table_number } : null
    };
  },

  // 3. Update Order Status (Admin)
  // Transition states: pending -> preparing -> ready -> served -> completed -> cancelled
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    const existing = getStoredOrders();

    let updatedOrder: Order | null = null;
    const isCompleted = status === 'completed';

    const updatedList = existing.map((o) => {
      if (o.id === orderId) {
        updatedOrder = { ...o, status, completed: isCompleted };
        return updatedOrder;
      }
      return o;
    });

    saveStoredOrders(updatedList);

    if (updatedOrder) {
      broadcastEvent('order:updated', updatedOrder);
    }

    if (token) {
      try {
        await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        });
      } catch {}
    }

    return true;
  },

  // 3b. Fast Order / Finalize without change (Customer 1-Minute Grace Period)
  async finalizeOrder(orderId: string): Promise<Order> {
    const local = getStoredOrders();
    let updatedOrder: Order | null = null;
    const updated = local.map((o) => {
      if (o.id === orderId || String(o.order_number) === String(orderId)) {
        const currentNotes = o.notes || '';
        const notes = currentNotes.includes('[FINALIZED]') ? currentNotes : `${currentNotes} [FINALIZED] [FAST_ORDER]`.trim();
        updatedOrder = {
          ...o,
          is_fast_order: true,
          is_finalized: true,
          notes
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      saveStoredOrders(updated);
      broadcastEvent('order:updated', updatedOrder);
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/finalize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const serverOrder = await res.json();
        const withFlag = {
          ...serverOrder,
          is_fast_order: true,
          is_finalized: true
        };
        const refreshed = getStoredOrders().map((o) => (o.id === orderId || o.id === serverOrder.id || o.order_number === serverOrder.order_number ? withFlag : o));
        saveStoredOrders(refreshed);
        broadcastEvent('order:updated', withFlag);
        return withFlag;
      }
    } catch {}

    return updatedOrder || (local.find((o) => o.id === orderId || String(o.order_number) === String(orderId)) as Order);
  },

  // 3c. Modify Order Items & Notes within 1-minute window (Customer)
  async modifyOrder(
    orderId: string,
    payload: {
      items: Array<{
        menu_id?: string | null;
        name: string;
        price: number;
        quantity: number;
        notes?: string | null;
      }>;
      notes?: string;
      is_finalized?: boolean;
    }
  ): Promise<Order> {
    let newTotal = 0;
    for (const it of payload.items) {
      newTotal += (Number(it.price) || 0) * (Number(it.quantity) || 1);
    }
    newTotal = Math.round(newTotal * 100) / 100;

    const local = getStoredOrders();
    let updatedOrder: Order | null = null;
    const updated = local.map((o) => {
      if (o.id === orderId) {
        const cleanNotes = (payload.notes !== undefined ? payload.notes : (o.notes || ''))
          .replace(/\[MODIFIED\]/g, '')
          .replace(/\[FINALIZED\]/g, '')
          .replace(/\[FAST_ORDER\]/g, '')
          .replace(/\[NO_CHANGE\]/g, '')
          .trim();
        const finalNotes = (cleanNotes + ' [MODIFIED]').trim();

        updatedOrder = {
          ...o,
          total_amount: newTotal,
          notes: finalNotes,
          is_modified: true,
          is_fast_order: false,
          is_finalized: false,
          items: payload.items.map((it, idx) => ({
            id: `item_${Date.now()}_${idx}`,
            order_id: orderId,
            menu_id: it.menu_id || null,
            item_name: it.name,
            item_price: Number(it.price) || 0,
            quantity: Math.max(1, Number(it.quantity) || 1),
            notes: it.notes || null
          }))
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      saveStoredOrders(updated);
      broadcastEvent('order:updated', updatedOrder);
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/modify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const serverOrder = await res.json();
        const refreshed = getStoredOrders().map((o) => (o.id === orderId ? serverOrder : o));
        saveStoredOrders(refreshed);
        return serverOrder;
      }
    } catch {}

    return updatedOrder || (local.find((o) => o.id === orderId) as Order);
  },

  // 4. Delete / Cancel Order (Admin)
  async deleteOrder(orderId: string): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    const existing = getStoredOrders();
    const filtered = existing.filter((o) => o.id !== orderId);
    saveStoredOrders(filtered);

    broadcastEvent('order:deleted', { id: orderId });

    if (token) {
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }

    return true;
  },

  // 5. Call Waiter (Customer)
  async callWaiter(payload: { table_number: number; reason: string; customer_name?: string }): Promise<WaiterCall> {
    const newCall: WaiterCall = {
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      table_number: payload.table_number,
      customer_name: payload.customer_name || null,
      reason: payload.reason,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const existing = getStoredWaiterCalls();
    saveStoredWaiterCalls([newCall, ...existing]);
    broadcastEvent('waiter:called', newCall);

    try {
      fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {}

    return newCall;
  },

  // 6. Get Waiter Calls (Admin)
  async getWaiterCalls(): Promise<WaiterCall[]> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    if (token) {
      try {
        const res = await fetch('/api/waiter-calls', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            saveStoredWaiterCalls(data);
            return data;
          }
        }
      } catch {}
    }
    return getStoredWaiterCalls();
  },

  // 7. Attend Waiter Call (Admin)
  async attendWaiterCall(id: string): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    const existing = getStoredWaiterCalls();
    const updated = existing.map((c) => (c.id === id ? { ...c, status: 'attended' as const } : c));
    saveStoredWaiterCalls(updated);
    broadcastEvent('waiter:attended', { id });

    if (token) {
      try {
        await fetch(`/api/waiter-calls/${id}/attend`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }

    return true;
  },

  // 8. Submit Customer Review (Customer)
  async submitReview(payload: {
    order_id?: string;
    table_number: number;
    customer_name?: string;
    rating: number;
    review_text?: string;
  }): Promise<Review> {
    const review: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_id: payload.order_id || null,
      table_number: payload.table_number,
      customer_name: payload.customer_name || null,
      rating: payload.rating,
      review_text: payload.review_text || null,
      created_at: new Date().toISOString()
    };

    const existing = getStoredReviews();
    saveStoredReviews([review, ...existing]);
    broadcastEvent('review:created', review);

    try {
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {}

    return review;
  },

  // 9. Get Customer Reviews (Admin)
  async getReviews(): Promise<Review[]> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    if (token) {
      try {
        const res = await fetch('/api/reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            saveStoredReviews(data);
            return data;
          }
        }
      } catch {}
    }
    return getStoredReviews();
  },

  // 10. Menu Management
  async getMenu(): Promise<MenuItem[]> {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveStoredMenu(data);
          return data;
        }
      }
    } catch {}
    return getStoredMenu();
  },

  async saveMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    const existing = getStoredMenu();
    let savedItem: MenuItem;

    if (item.id) {
      savedItem = { ...existing.find((i) => i.id === item.id)!, ...item } as MenuItem;
      const updated = existing.map((i) => (i.id === item.id ? savedItem : i));
      saveStoredMenu(updated);
    } else {
      savedItem = {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: item.name || 'New Dish',
        description: item.description || '',
        category: item.category || 'Meals & Mains',
        price: Number(item.price) || 0,
        image_url: item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
        available: item.available !== false,
        is_veg: item.is_veg !== false
      };
      saveStoredMenu([savedItem, ...existing]);
    }

    broadcastEvent('menu:updated', savedItem);

    if (token) {
      try {
        const method = item.id ? 'PUT' : 'POST';
        const url = item.id ? `/api/menu/${item.id}` : '/api/menu';
        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(item)
        });
      } catch {}
    }

    return savedItem;
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    const existing = getStoredMenu();
    const filtered = existing.filter((i) => i.id !== id);
    saveStoredMenu(filtered);

    broadcastEvent('menu:deleted', { id });

    if (token) {
      try {
        await fetch(`/api/menu/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }

    return true;
  },

  // 11. Tables Management
  async getTables(): Promise<Table[]> {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveStoredTables(data);
          return data;
        }
      }
    } catch {}
    return getStoredTables();
  },

  async addTable(tableNumber: number): Promise<Table> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    const existing = getStoredTables();
    const newTable: Table = {
      id: `tbl_${Date.now()}`,
      table_number: tableNumber,
      qr_code: `/menu?table=${tableNumber}`
    };

    const updated = [...existing, newTable].sort((a, b) => a.table_number - b.table_number);
    saveStoredTables(updated);
    broadcastEvent('table:updated', newTable);

    if (token) {
      try {
        await fetch('/api/tables', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ table_number: tableNumber })
        });
      } catch {}
    }

    return newTable;
  },

  async deleteTable(id: string): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    const existing = getStoredTables();
    const filtered = existing.filter((t) => t.id !== id);
    saveStoredTables(filtered);
    broadcastEvent('table:deleted', { id });

    if (token) {
      try {
        await fetch(`/api/tables/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }

    return true;
  },

  // 12. Sales Analytics
  async getSalesAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalItemsSold: number;
    topItems: Array<{ name: string; count: number; revenue: number }>;
  }> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    if (token) {
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {}
    }

    // Compute from local orders if offline
    const orders = getStoredOrders();
    let totalRevenue = 0;
    let totalItemsSold = 0;
    const itemMap: Record<string, { count: number; revenue: number }> = {};

    for (const o of orders) {
      if (o.status !== 'cancelled') {
        totalRevenue += o.total_amount;
      }
      for (const it of o.items) {
        totalItemsSold += it.quantity;
        if (!itemMap[it.item_name]) itemMap[it.item_name] = { count: 0, revenue: 0 };
        itemMap[it.item_name].count += it.quantity;
        itemMap[it.item_name].revenue += it.item_price * it.quantity;
      }
    }

    const topItems = Object.entries(itemMap)
      .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
      totalItemsSold,
      topItems
    };
  },

  // 13. Export Completed Orders as Excel (.xlsx) with Unique Order IDs
  async exportOrdersToExcel(): Promise<{ count: number; filename: string }> {
    const orders = await this.getOrders();
    const summaryRows: any[] = [];
    const itemizedRows: any[] = [];

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at).toLocaleDateString('en-IN');
      const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN');
      const itemsList = order.items && order.items.length > 0
        ? order.items.map((it) => `${it.quantity}x ${it.item_name}${it.notes ? ` (${it.notes})` : ''}`).join(', ')
        : 'No items recorded';
      const totalItemsCount = order.items && order.items.length > 0
        ? order.items.reduce((sum, it) => sum + (it.quantity || 1), 0)
        : 0;

      // Unique Order Row: Order # appears EXACTLY ONCE per order (No repetitions!)
      summaryRows.push({
        'Order #': `#${order.order_number}`,
        'Table Number': `Table ${order.table_number}`,
        'Customer Name': order.customer_name || 'Guest',
        'Customer Phone': order.customer_phone || 'N/A',
        'Date': orderDate,
        'Time': orderTime,
        'Status': (order.status || 'PENDING').toUpperCase(),
        'Items Summary': itemsList,
        'Total Items': totalItemsCount,
        'Order Total (₹)': Number(order.total_amount).toFixed(2),
        'Special Instructions / Notes': order.notes || 'None'
      });

      // Itemized Breakdown: Each individual item line with a distinct Item Entry #
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, idx) => {
          itemizedRows.push({
            'Item Entry #': `#${order.order_number}-${idx + 1}`,
            'Order #': `#${order.order_number}`,
            'Table Number': `Table ${order.table_number}`,
            'Customer Name': order.customer_name || 'Guest',
            'Date': orderDate,
            'Time': orderTime,
            'Item # in Order': idx + 1,
            'Item Name': item.item_name,
            'Special Instructions': item.notes || 'None',
            'Unit Price (₹)': Number(item.item_price).toFixed(2),
            'Quantity': item.quantity,
            'Subtotal (₹)': (Number(item.item_price) * item.quantity).toFixed(2),
            'Order Total (₹)': Number(order.total_amount).toFixed(2),
            'Order Status': (order.status || 'PENDING').toUpperCase()
          });
        });
      }
    });

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Orders Summary (Each row is a UNIQUE order; Order # never repeats!)
    const summarySheet = XLSX.utils.json_to_sheet(
      summaryRows.length > 0 ? summaryRows : [{ Message: 'No orders recorded' }]
    );
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Orders Summary');

    // Sheet 2: Itemized Breakdown (Dish-level line items with unique Item Entry #)
    if (itemizedRows.length > 0) {
      const itemizedSheet = XLSX.utils.json_to_sheet(itemizedRows);
      XLSX.utils.book_append_sheet(workbook, itemizedSheet, 'Itemized Breakdown');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `ScanDine_Hotel_Orders_${todayStr}.xlsx`;
    XLSX.writeFile(workbook, filename);

    return { count: orders.length, filename };
  },

  // 14. Export and Clear Shift Orders
  async exportAndClearOrders(password?: string): Promise<{ count: number; filename: string }> {
    const res = await this.exportOrdersToExcel();
    saveStoredOrders([]);
    broadcastEvent('orders:cleared', {});

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');
    if (token) {
      try {
        await fetch('/api/orders/export-and-clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ password: password || 'admin123' })
        });
      } catch {}
    }

    return res;
  },

  // 14. Admin Authentication
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      let data: any = null;
      try {
        const text = await res.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch {
        data = null;
      }

      if (res.ok && data?.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem('aura_cafe_token', data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        localStorage.setItem('aura_cafe_admin_user', JSON.stringify(data.user));
        return data;
      } else if (data?.error) {
        throw new Error(data.error);
      } else if (!res.ok) {
        throw new Error('Invalid administrator credentials');
      }
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback if offline/network issue and user is admin
    if (username === 'admin' && password === 'admin123') {
      const fallbackToken = 'scandine_jwt_token_' + Date.now();
      const user = { id: 'admin-sanjivani', username: 'admin' };
      localStorage.setItem(STORAGE_KEYS.TOKEN, fallbackToken);
      localStorage.setItem('aura_cafe_token', fallbackToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem('aura_cafe_admin_user', JSON.stringify(user));
      return { token: fallbackToken, user };
    }

    throw new Error('Invalid administrator credentials');
  },

  // 14b. Update Admin Credentials (Username & Password)
  async updateAdminCredentials(payload: {
    newUsername?: string;
    currentPassword: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message: string; user: AdminUser }> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('aura_cafe_token');

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    let data: any = null;
    try {
      const text = await res.text();
      if (text) data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!res.ok) {
      throw new Error(data?.error || 'Failed to update admin credentials');
    }

    if (data?.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem('aura_cafe_token', data.token);
    }
    if (data?.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      localStorage.setItem('aura_cafe_admin_user', JSON.stringify(data.user));
    }

    return data;
  },

  // 15. System Settings (Editable Brand / Restaurant Name)
  async getSettings(): Promise<{ brandName: string; tagline: string }> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.brandName) {
          localStorage.setItem('scandine_brand_name', data.brandName);
          if (data.tagline) localStorage.setItem('scandine_tagline', data.tagline);
          return data;
        }
      }
    } catch {}

    return {
      brandName: localStorage.getItem('scandine_brand_name') || 'ScanDine',
      tagline: localStorage.getItem('scandine_tagline') || 'Smart QR Hotel Table Ordering System'
    };
  },

  async saveSettings(settings: { brandName: string; tagline?: string }): Promise<{ brandName: string; tagline: string }> {
    const brandName = settings.brandName.trim() || 'ScanDine';
    const tagline = settings.tagline?.trim() || 'Smart QR Hotel Table Ordering System';

    localStorage.setItem('scandine_brand_name', brandName);
    localStorage.setItem('scandine_tagline', tagline);
    broadcastEvent('brand:updated', { brandName, tagline });

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, tagline })
      });
    } catch {}

    return { brandName, tagline };
  }
};
