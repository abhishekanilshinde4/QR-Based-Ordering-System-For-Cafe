import fs from 'fs';
import path from 'path';

// Storage paths in /tmp for AWS Lambda / Netlify Functions
const TMP_ORDERS_FILE = path.join('/tmp', 'aura_cafe_orders.json');
const TMP_MENU_FILE = path.join('/tmp', 'aura_cafe_menu.json');
const TMP_TABLES_FILE = path.join('/tmp', 'aura_cafe_tables.json');

const DEFAULT_MENU = [
  {
    id: 'abcf8854-1944-48e3-b9a3-6809c7043296',
    name: 'Signature Kadak Kulhad Chai',
    description: 'Slow-simmered rich milky tea infused with crushed ginger and green cardamom, served in an authentic earthen clay kulhad.',
    category: 'Chai & Hot Teas',
    price: 60.0,
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: 'b3595976-13f8-4745-a5de-72d5222f1c0c',
    name: 'Special Masala Chai',
    description: 'Aromatic spiced tea simmered with freshly crushed cinnamon, cloves, black pepper, and ginger.',
    category: 'Chai & Hot Teas',
    price: 50.0,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: '6f3cac9d-4036-4dae-aa36-b239d1f32ab6',
    name: 'Bombay Cutting Chai',
    description: 'Half-glass piping hot strong Mumbai cutting chai brewed with fragrant tea leaves and full cream milk.',
    category: 'Chai & Hot Teas',
    price: 35.0,
    image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: '80260c4f-9eb8-472d-9007-d1bf6ae19930',
    name: 'Kashmiri Saffron Kahwa',
    description: 'Exotic green tea brewed with real saffron strands, whole cinnamon, and slivered almonds.',
    category: 'Chai & Hot Teas',
    price: 120.0,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: 'd8321b2e-9d86-4284-9736-b30bad6b6ce9',
    name: 'Classic Bun Maska & Dip',
    description: 'Freshly toasted pillowy soft bun generously slathered with salted butter, perfect to dunk in hot chai.',
    category: 'Buns & Snacks',
    price: 70.0,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: '6c47835e-75a7-48c3-825f-777103adbef4',
    name: 'Crispy Samosa Pav (2 Pcs)',
    description: 'Golden spiced potato samosas stuffed inside fresh pav with mint chutney and spicy garlic dry chutney.',
    category: 'Buns & Snacks',
    price: 80.0,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: '7c4f5499-a671-403a-82c6-f9974e6efba5',
    name: 'Chili Cheese Garlic Toast',
    description: 'Toasted artisan bread topped with bubbling molten mozzarella, cheddar, bell peppers, herbs, and green chilies.',
    category: 'Buns & Snacks',
    price: 150.0,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    available: true
  },
  {
    id: '26d92d60-0bed-435b-89d9-b89267aef16a',
    name: 'Thick Creamy Cold Coffee',
    description: 'Chilled espresso blended with rich cream and vanilla ice cream, topped with chocolate drizzle.',
    category: 'Cold Brews & Iced',
    price: 140.0,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800',
    available: true
  }
];

const DEFAULT_TABLES = [
  { id: 't1', table_number: 1, qr_code: '/menu?table=1' },
  { id: 't2', table_number: 2, qr_code: '/menu?table=2' },
  { id: 't3', table_number: 3, qr_code: '/menu?table=3' },
  { id: 't4', table_number: 4, qr_code: '/menu?table=4' },
  { id: 't5', table_number: 5, qr_code: '/menu?table=5' },
  { id: 't6', table_number: 6, qr_code: '/menu?table=6' }
];

function readJsonFile(filePath: string, fallback: any) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch {}
  return fallback;
}

function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export const handler = async (event: any, context: any) => {
  const method = event.httpMethod || 'GET';
  // Normalize path by stripping Netlify function prefix and /api
  let reqPath = event.path || '/';
  reqPath = reqPath.replace(/^\/\.netlify\/functions\/api/, '');
  reqPath = reqPath.replace(/^\/api/, '');
  if (!reqPath.startsWith('/')) reqPath = '/' + reqPath;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // 1. AUTH: Login
    if (reqPath === '/auth/login' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (body.username === 'admin' && body.password === 'admin123') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            token: 'mock_jwt_token_cafe_chai_affair_admin',
            user: { id: 'admin_1', username: 'admin' }
          })
        };
      }
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid username or password' })
      };
    }

    // 2. MENU: Get all menu items
    if (reqPath === '/menu' && method === 'GET') {
      const menu = readJsonFile(TMP_MENU_FILE, DEFAULT_MENU);
      return { statusCode: 200, headers, body: JSON.stringify(menu) };
    }

    // MENU: Add menu item
    if (reqPath === '/menu' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const menu = readJsonFile(TMP_MENU_FILE, DEFAULT_MENU);
      const newItem = {
        id: `menu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: body.name || 'New Item',
        description: body.description || '',
        category: body.category || 'Specialties',
        price: Number(body.price) || 0,
        image_url: body.image_url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
        available: body.available !== false
      };
      menu.push(newItem);
      writeJsonFile(TMP_MENU_FILE, menu);
      return { statusCode: 201, headers, body: JSON.stringify(newItem) };
    }

    // MENU: Update item
    if (reqPath.startsWith('/menu/') && method === 'PUT') {
      const itemId = reqPath.split('/')[2];
      const body = JSON.parse(event.body || '{}');
      const menu = readJsonFile(TMP_MENU_FILE, DEFAULT_MENU);
      const idx = menu.findIndex((m: any) => m.id === itemId);
      if (idx !== -1) {
        menu[idx] = { ...menu[idx], ...body };
        writeJsonFile(TMP_MENU_FILE, menu);
        return { statusCode: 200, headers, body: JSON.stringify(menu[idx]) };
      }
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found' }) };
    }

    // MENU: Delete item
    if (reqPath.startsWith('/menu/') && method === 'DELETE') {
      const itemId = reqPath.split('/')[2];
      const menu = readJsonFile(TMP_MENU_FILE, DEFAULT_MENU);
      const filtered = menu.filter((m: any) => m.id !== itemId);
      writeJsonFile(TMP_MENU_FILE, filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: itemId }) };
    }

    // 3. TABLES: Get tables
    if (reqPath === '/tables' && method === 'GET') {
      const tables = readJsonFile(TMP_TABLES_FILE, DEFAULT_TABLES);
      return { statusCode: 200, headers, body: JSON.stringify(tables) };
    }

    // TABLES: Add table
    if (reqPath === '/tables' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const tableNum = parseInt(body.table_number, 10);
      const tables = readJsonFile(TMP_TABLES_FILE, DEFAULT_TABLES);
      const newTable = {
        id: `t_${Date.now()}`,
        table_number: tableNum,
        qr_code: `/menu?table=${tableNum}`
      };
      tables.push(newTable);
      tables.sort((a: any, b: any) => a.table_number - b.table_number);
      writeJsonFile(TMP_TABLES_FILE, tables);
      return { statusCode: 201, headers, body: JSON.stringify(newTable) };
    }

    // TABLES: Delete table
    if (reqPath.startsWith('/tables/') && method === 'DELETE') {
      const tableId = reqPath.split('/')[2];
      const tables = readJsonFile(TMP_TABLES_FILE, DEFAULT_TABLES);
      const filtered = tables.filter((t: any) => t.id !== tableId);
      writeJsonFile(TMP_TABLES_FILE, filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: tableId }) };
    }

    // 4. ORDERS: Place Order (Customer)
    if (reqPath === '/orders' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const items = Array.isArray(body.items) ? body.items : [];
      const tableNum = parseInt(body.table_number, 10) || 1;

      if (items.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Order items are required' })
        };
      }

      let total = 0;
      const orderItems = items.map((it: any, idx: number) => {
        const price = Number(it.price || it.item_price || 0);
        const qty = Math.max(1, Number(it.quantity || 1));
        total += price * qty;
        return {
          id: `item_${Date.now()}_${idx}`,
          order_id: '',
          menu_id: it.menu_id || null,
          item_name: it.name || it.item_name || 'Item',
          item_price: price,
          quantity: qty,
          notes: it.notes || null
        };
      });

      const orders = readJsonFile(TMP_ORDERS_FILE, []);
      const highestNum = orders.reduce((max: number, o: any) => Math.max(max, Number(o.order_number) || 0), 1000);
      const orderNumber = highestNum + 1;
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        table_number: tableNum,
        total_amount: Math.round(total * 100) / 100,
        notes: body.notes || null,
        completed: false,
        created_at: new Date().toISOString(),
        items: orderItems
      };

      orders.unshift(newOrder);
      writeJsonFile(TMP_ORDERS_FILE, orders);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newOrder)
      };
    }

    // ORDERS: Get all orders (Admin)
    if (reqPath === '/orders' && method === 'GET') {
      const orders = readJsonFile(TMP_ORDERS_FILE, []);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(orders)
      };
    }

    // ORDERS: Complete Order
    if (reqPath.startsWith('/orders/') && reqPath.endsWith('/complete') && (method === 'PUT' || method === 'PATCH')) {
      const parts = reqPath.split('/');
      const orderId = parts[2];
      const orders = readJsonFile(TMP_ORDERS_FILE, []);
      const idx = orders.findIndex((o: any) => o.id === orderId);
      if (idx !== -1) {
        orders[idx].completed = true;
        writeJsonFile(TMP_ORDERS_FILE, orders);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(orders[idx])
        };
      }
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Order not found' }) };
    }

    // ORDERS: Delete Order
    if (reqPath.startsWith('/orders/') && method === 'DELETE') {
      const orderId = reqPath.split('/')[2];
      const orders = readJsonFile(TMP_ORDERS_FILE, []);
      const filtered = orders.filter((o: any) => o.id !== orderId);
      writeJsonFile(TMP_ORDERS_FILE, filtered);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id: orderId })
      };
    }

    // ORDERS: Export & Clear
    if (reqPath === '/orders/export-and-clear' && method === 'POST') {
      const orders = readJsonFile(TMP_ORDERS_FILE, []);
      writeJsonFile(TMP_ORDERS_FILE, []);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count: orders.length, orders })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Not found: ${method} ${reqPath}` })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' })
    };
  }
};
