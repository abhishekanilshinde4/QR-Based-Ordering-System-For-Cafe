import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';
import { prisma } from './src/server/db.js';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthRequest } from './src/server/auth.js';

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  
  // Initialize Socket.IO
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  });

  app.use(express.json({ limit: '10mb' }));

  // Socket.IO Connection Handler
  io.on('connection', (socket) => {
    console.log('[ScanDine Socket.IO] Client connected:', socket.id);

    // Instant real-time order finalization from customer
    socket.on('order:finalize', async (data) => {
      try {
        const orderId = data?.id;
        if (!orderId) return;
        const order = await prisma.orders.findFirst({
          where: {
            OR: [
              { id: String(orderId) },
              { order_number: isNaN(Number(orderId)) ? -1 : Number(orderId) }
            ]
          },
          include: { items: true, review: true }
        });
        if (order && order.status === 'pending') {
          const currentNotes = order.notes || '';
          const newNotes = currentNotes.includes('[FINALIZED]') ? currentNotes : (currentNotes + ' [FINALIZED] [FAST_ORDER]').trim();
          const updated = await prisma.orders.update({
            where: { id: order.id },
            data: { notes: newNotes },
            include: { items: true, review: true }
          });
          const formatted = attachOrderFlags(updated);
          broadcast('order:updated', formatted);
        }
      } catch (err) {
        console.error('Socket order:finalize error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('[ScanDine Socket.IO] Client disconnected:', socket.id);
    });
  });

  // Helper to emit events to all connected clients
  const broadcast = (event: string, data: any) => {
    io.emit(event, data);
  };

  // Seed Initial Data (Admin, Tables, Menu Items)
  async function seedDatabase() {
    try {
      // 1. Seed Admin
      const adminCount = await prisma.admin.count();
      if (adminCount === 0) {
        await prisma.admin.create({
          data: {
            username: 'admin',
            password_hash: hashPassword('admin123')
          }
        });
        console.log('[ScanDine DB Seed] Default admin created (username: admin, pass: admin123)');
      }

      // 2. Seed Tables (Tables 1-10)
      const tableCount = await prisma.tables.count();
      if (tableCount === 0) {
        for (let i = 1; i <= 10; i++) {
          await prisma.tables.create({
            data: {
              table_number: i,
              qr_code: `/menu?table=${i}`
            }
          });
        }
        console.log('[ScanDine DB Seed] Default tables 1 to 10 seeded');
      }

      // 3. Seed Menu Items
      const menuCount = await prisma.menu.count();
      if (menuCount === 0) {
        const seedItems = [
          {
            name: 'Signature Masala Chai (कुल्हड चहा)',
            description: 'Slow-simmered rich tea brewed with crushed ginger, cardamom, cinnamon, and fresh milk in an authentic earthen clay kulhad.',
            category: 'Chai & Hot Teas',
            price: 25.00,
            image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Kolhapuri Special Misal Pav',
            description: 'Fiery spiced sprouted moth bean curry topped with crunchy farsan, diced onions, lemon, and 2 fresh butter-toasted pav.',
            category: 'Buns & Snacks',
            price: 80.00,
            image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Crispy Batata Vada Pav (2 Pcs)',
            description: 'Golden spiced potato fritters served inside fluffy ladi pav with spicy dry garlic chutney and fresh mint dip.',
            category: 'Buns & Snacks',
            price: 40.00,
            image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Maharashtra Kanda Poha',
            description: 'Flattened rice tossed with roasted peanuts, curry leaves, mustard seeds, turmeric, and freshly grated coconut.',
            category: 'Buns & Snacks',
            price: 45.00,
            image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Butter Pav Bhaji (Special)',
            description: 'Mashed spiced seasonal vegetable curry slow-simmered with aromatic pav bhaji masala, loaded with Amul butter.',
            category: 'Meals & Mains',
            price: 120.00,
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'South Indian Butter Masala Dosa',
            description: 'Crisp golden fermented rice crepe rolled with tempered potato masala, served with piping hot dal sambar & coconut chutney.',
            category: 'Meals & Mains',
            price: 90.00,
            image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Steamed Idli Sambar (3 Pcs)',
            description: 'Soft pillow-like steamed fermented rice cakes served with authentic spiced vegetable sambar and fresh coconut dip.',
            category: 'Meals & Mains',
            price: 60.00,
            image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Paneer Butter Masala with 3 Butter Roti',
            description: 'Soft cottage cheese cubes simmered in a creamy, velvety tomato cashew gravy garnished with fresh kasuri methi.',
            category: 'Meals & Mains',
            price: 180.00,
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Thick Creamy Cold Coffee with Ice Cream',
            description: 'Chilled espresso blended with rich cream, vanilla ice cream, and dark chocolate drizzle.',
            category: 'Chai & Hot Teas',
            price: 70.00,
            image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          },
          {
            name: 'Sizzling Hot Gulab Jamun (2 Pcs)',
            description: 'Golden fried khoya dumplings steeped in warm rose-cardamom sugar syrup, served warm.',
            category: 'Desserts & Sweets',
            price: 50.00,
            image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800',
            available: true,
            is_veg: true
          }
        ];

        for (const item of seedItems) {
          await prisma.menu.create({ data: item });
        }
        console.log('[ScanDine DB Seed] Default menu items seeded successfully');
      }
    } catch (err) {
      console.error('[ScanDine DB Seed] Error during seed:', err);
    }
  }

  await seedDatabase();

  // --- API ROUTES ---

  let systemSettings = {
    brandName: 'ScanDine',
    tagline: 'Smart QR Hotel Table Ordering System'
  };

  app.get('/api/settings', (req, res) => {
    res.json(systemSettings);
  });

  app.post('/api/settings', (req, res) => {
    const { brandName, tagline } = req.body;
    if (brandName) systemSettings.brandName = String(brandName).trim();
    if (tagline) systemSettings.tagline = String(tagline).trim();
    broadcast('brand:updated', systemSettings);
    res.json(systemSettings);
  });

  // Auth: Login (POST /api/auth/login)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      let admin = await prisma.admin.findUnique({ where: { username } });
      if (!admin && username === 'admin') {
        const count = await prisma.admin.count();
        if (count === 0) {
          admin = await prisma.admin.create({
            data: {
              username: 'admin',
              password_hash: hashPassword('admin123')
            }
          });
        }
      }

      if (!admin || !comparePassword(password, admin.password_hash)) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = generateToken({ id: admin.id, username: admin.username });
      return res.json({ token, user: { id: admin.id, username: admin.username } });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Auth: Current User (GET /api/auth/me)
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    return res.json({ user: req.user });
  });

  // Auth: Change Username & Password (PUT /api/auth/profile) - Admin Protected
  app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.user?.id;
      const currentUsername = req.user?.username;
      const { newUsername, currentPassword, newPassword } = req.body;

      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to save changes.' });
      }

      // Find current admin account
      let admin = null;
      if (currentUserId && currentUserId !== 'admin-default') {
        admin = await prisma.admin.findUnique({ where: { id: currentUserId } });
      }
      if (!admin && currentUsername) {
        admin = await prisma.admin.findUnique({ where: { username: currentUsername } });
      }
      if (!admin) {
        admin = await prisma.admin.findFirst();
      }

      if (!admin) {
        // Create initial admin if none existed
        admin = await prisma.admin.create({
          data: {
            username: 'admin',
            password_hash: hashPassword('admin123')
          }
        });
      }

      // Verify current password
      const isPasswordValid = comparePassword(currentPassword, admin.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      const trimmedNewUsername = newUsername ? String(newUsername).trim() : admin.username;
      if (trimmedNewUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
      }

      // Verify unique username
      if (trimmedNewUsername !== admin.username) {
        const existing = await prisma.admin.findUnique({ where: { username: trimmedNewUsername } });
        if (existing && existing.id !== admin.id) {
          return res.status(400).json({ error: `Username "${trimmedNewUsername}" is already taken.` });
        }
      }

      const updateData: { username: string; password_hash?: string } = {
        username: trimmedNewUsername
      };

      if (newPassword && String(newPassword).trim().length > 0) {
        const cleanPassword = String(newPassword).trim();
        if (cleanPassword.length < 4) {
          return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
        }
        updateData.password_hash = hashPassword(cleanPassword);
      }

      const updated = await prisma.admin.update({
        where: { id: admin.id },
        data: updateData
      });

      const newToken = generateToken({ id: updated.id, username: updated.username });

      return res.json({
        success: true,
        message: 'Admin username and password successfully updated!',
        token: newToken,
        user: { id: updated.id, username: updated.username }
      });
    } catch (err: any) {
      console.error('Update admin profile error:', err);
      return res.status(500).json({ error: err.message || 'Failed to update credentials' });
    }
  });

  // Menu: Get all items (GET /api/menu) - Public
  app.get('/api/menu', async (req, res) => {
    try {
      const items = await prisma.menu.findMany({
        orderBy: { created_at: 'asc' }
      });
      return res.json(items);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  });

  // Menu: Add item (POST /api/menu) - Admin Protected
  app.post('/api/menu', authenticateToken, async (req, res) => {
    try {
      const { name, description, category, price, image_url, available, is_veg } = req.body;
      if (!name || price === undefined || !category) {
        return res.status(400).json({ error: 'Name, category, and price are required' });
      }

      const newItem = await prisma.menu.create({
        data: {
          name,
          description: description || '',
          category,
          price: parseFloat(price),
          image_url: image_url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
          available: available !== undefined ? available : true,
          is_veg: is_veg !== undefined ? is_veg : true
        }
      });

      broadcast('menu:updated', { type: 'create', item: newItem });
      return res.status(201).json(newItem);
    } catch (err) {
      console.error('Add menu error:', err);
      return res.status(500).json({ error: 'Failed to add menu item' });
    }
  });

  // Menu: Edit item (PUT /api/menu/:id) - Admin Protected
  app.put('/api/menu/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, price, image_url, available, is_veg } = req.body;

      const updated = await prisma.menu.update({
        where: { id },
        data: {
          name,
          description,
          category,
          price: price !== undefined ? parseFloat(price) : undefined,
          image_url,
          available,
          is_veg
        }
      });

      broadcast('menu:updated', { type: 'update', item: updated });
      return res.json(updated);
    } catch (err) {
      console.error('Edit menu error:', err);
      return res.status(500).json({ error: 'Failed to update menu item' });
    }
  });

  // Menu: Delete item (DELETE /api/menu/:id) - Admin Protected
  app.delete('/api/menu/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.menu.delete({ where: { id } });

      broadcast('menu:updated', { type: 'delete', id });
      return res.json({ success: true, id });
    } catch (err) {
      console.error('Delete menu error:', err);
      return res.status(500).json({ error: 'Failed to delete menu item' });
    }
  });

  // Helper to attach is_finalized, is_fast_order and is_modified flags
  function attachOrderFlags(order: any) {
    if (!order) return order;
    const is_fast_order = Boolean(order.notes?.includes('[FAST_ORDER]') || order.notes?.includes('[NO_CHANGE]'));
    const is_finalized = Boolean(order.notes?.includes('[FINALIZED]') || is_fast_order);
    const is_modified = Boolean(order.notes?.includes('[MODIFIED]'));
    return {
      ...order,
      is_fast_order,
      is_finalized,
      is_modified
    };
  }

  // Orders: Get all orders (GET /api/orders) - Admin Protected
  app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
      const orders = await prisma.orders.findMany({
        include: { items: true, review: true },
        orderBy: { created_at: 'desc' }
      });
      return res.json(orders.map(attachOrderFlags));
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Orders: Place order (POST /api/orders) - Public Customer
  app.post('/api/orders', async (req, res) => {
    try {
      const { table_number, items, notes, customer_name, customer_phone } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      const tableNum = parseInt(table_number) || 1;

      // Validate items & calculate total amount
      let calculatedTotal = 0;
      const allMenuItems = await prisma.menu.findMany();
      const menuIdMap = new Map(allMenuItems.map((m) => [m.id, m]));
      const menuNameMap = new Map(allMenuItems.map((m) => [m.name.trim().toLowerCase(), m]));

      const orderItemsData = items.map((item: any) => {
        const itemPrice = parseFloat(item.price ?? item.item_price ?? 0);
        const qty = Math.max(1, parseInt(item.quantity ?? 1));
        calculatedTotal += itemPrice * qty;

        const itemName = item.name || item.item_name || 'Item';
        let resolvedMenuId: string | null = null;

        if (item.menu_id && menuIdMap.has(item.menu_id)) {
          resolvedMenuId = item.menu_id;
        } else if (menuNameMap.has(itemName.trim().toLowerCase())) {
          resolvedMenuId = menuNameMap.get(itemName.trim().toLowerCase())!.id;
        }

        return {
          menu_id: resolvedMenuId,
          item_name: itemName,
          item_price: itemPrice,
          quantity: qty,
          notes: item.notes || null
        };
      });

      // Generate sequential order number with retry to ensure strict uniqueness
      let newOrder = null;
      let attempts = 0;
      while (!newOrder && attempts < 5) {
        attempts++;
        const lastOrder = await prisma.orders.findFirst({
          orderBy: { order_number: 'desc' },
          select: { order_number: true }
        });
        const orderNumber = (lastOrder && lastOrder.order_number >= 1000) ? lastOrder.order_number + 1 : 1001;

        try {
          newOrder = await prisma.orders.create({
            data: {
              order_number: orderNumber,
              table_number: tableNum,
              customer_name: customer_name ? String(customer_name).trim() : null,
              customer_phone: customer_phone ? String(customer_phone).trim() : null,
              total_amount: Math.round(calculatedTotal * 100) / 100,
              status: 'pending',
              notes: notes || null,
              completed: false,
              items: {
                create: orderItemsData
              }
            },
            include: { items: true, review: true }
          });
        } catch (createErr: any) {
          if (createErr.code === 'P2002' && attempts < 5) {
            continue; // Unique constraint on order_number collided, retry with updated next number
          }
          throw createErr;
        }
      }

      broadcast('order:placed', newOrder);
      return res.status(201).json(newOrder);
    } catch (err: any) {
      console.error('Place order error:', err);
      return res.status(500).json({ error: err.message || 'Failed to place order' });
    }
  });

  // Orders: Customer Order Tracking & Customer Login Lookup (GET /api/orders/track) - Public Customer
  app.get('/api/orders/track', async (req, res) => {
    try {
      const { phone, order_number, table } = req.query;

      const whereClause: any = {};
      if (phone) {
        const cleanPhone = String(phone).trim().replace(/\D/g, '');
        if (cleanPhone) {
          whereClause.customer_phone = cleanPhone;
        }
      } else if (order_number) {
        const num = parseInt(String(order_number).replace(/\D/g, ''), 10);
        if (!isNaN(num)) {
          whereClause.order_number = num;
        }
      } else if (table) {
        const tbl = parseInt(String(table), 10);
        if (!isNaN(tbl)) {
          whereClause.table_number = tbl;
        }
      }

      if (Object.keys(whereClause).length === 0) {
        return res.status(400).json({ error: 'Please provide phone number, order number, or table number' });
      }

      const orders = await prisma.orders.findMany({
        where: whereClause,
        include: { items: true, review: true },
        orderBy: { created_at: 'desc' },
        take: 15
      });

      const customer_name = orders.find((o) => o.customer_name)?.customer_name || null;
      const customer_phone = orders.find((o) => o.customer_phone)?.customer_phone || null;
      const table_number = orders[0]?.table_number || null;

      const formattedOrders = orders.map(attachOrderFlags);

      return res.json({
        orders: formattedOrders,
        customer: customer_name ? { name: customer_name, phone: customer_phone, table_number } : null
      });
    } catch (err: any) {
      console.error('Track orders error:', err);
      return res.status(500).json({ error: 'Failed to query order records' });
    }
  });

  // Orders: Fast Order / Finalize without changes (PATCH & POST /api/orders/:id/finalize) - Public Customer
  const finalizeOrderHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const order = await prisma.orders.findFirst({
        where: {
          OR: [
            { id: String(id) },
            { order_number: isNaN(Number(id)) ? -1 : Number(id) }
          ]
        },
        include: { items: true, review: true }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ error: 'Order is already being prepared or completed' });
      }

      const currentNotes = order.notes || '';
      const newNotes = currentNotes.includes('[FINALIZED]') ? currentNotes : (currentNotes + ' [FINALIZED] [FAST_ORDER]').trim();

      const updated = await prisma.orders.update({
        where: { id: order.id },
        data: { notes: newNotes },
        include: { items: true, review: true }
      });

      const formatted = attachOrderFlags(updated);
      broadcast('order:updated', formatted);
      return res.json(formatted);
    } catch (err: any) {
      console.error('Finalize order error:', err);
      return res.status(500).json({ error: 'Failed to finalize order' });
    }
  };
  app.patch('/api/orders/:id/finalize', finalizeOrderHandler);
  app.post('/api/orders/:id/finalize', finalizeOrderHandler);

  // Orders: Change/Edit Order items & notes within 1-minute window (PATCH /api/orders/:id/modify) - Public Customer
  app.patch('/api/orders/:id/modify', async (req, res) => {
    try {
      const { id } = req.params;
      const { items, notes, is_finalized } = req.body;

      const order = await prisma.orders.findUnique({
        where: { id },
        include: { items: true, review: true }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ error: 'Order has already started preparation and cannot be modified' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least 1 item' });
      }

      // Calculate new total
      let calculatedTotal = 0;
      const allMenuItems = await prisma.menu.findMany();
      const menuIdMap = new Map(allMenuItems.map((m) => [m.id, m]));
      const menuNameMap = new Map(allMenuItems.map((m) => [m.name.trim().toLowerCase(), m]));

      const newItemsData = items.map((item: any) => {
        const itemPrice = parseFloat(item.price ?? item.item_price ?? 0);
        const qty = Math.max(1, parseInt(item.quantity ?? 1));
        calculatedTotal += itemPrice * qty;

        const itemName = item.name || item.item_name || 'Item';
        let resolvedMenuId: string | null = null;

        if (item.menu_id && menuIdMap.has(item.menu_id)) {
          resolvedMenuId = item.menu_id;
        } else if (menuNameMap.has(itemName.trim().toLowerCase())) {
          resolvedMenuId = menuNameMap.get(itemName.trim().toLowerCase())!.id;
        }

        return {
          order_id: id,
          menu_id: resolvedMenuId,
          item_name: itemName,
          item_price: itemPrice,
          quantity: qty,
          notes: item.notes || null
        };
      });

      // Delete existing items and recreate updated items
      await prisma.order_Items.deleteMany({ where: { order_id: id } });
      await prisma.order_Items.createMany({ data: newItemsData });

      // Format updated notes with metadata tag
      const existingClean = (notes !== undefined ? notes : (order.notes || ''))
        .replace(/\[MODIFIED\]/g, '')
        .replace(/\[FINALIZED\]/g, '')
        .replace(/\[FAST_ORDER\]/g, '')
        .trim();

      let newNotes = (existingClean + ' [MODIFIED]').trim();
      if (is_finalized) {
        newNotes += ' [FINALIZED]';
      }

      const updated = await prisma.orders.update({
        where: { id },
        data: {
          total_amount: Math.round(calculatedTotal * 100) / 100,
          notes: newNotes
        },
        include: { items: true, review: true }
      });

      const formatted = attachOrderFlags(updated);
      broadcast('order:updated', formatted);
      return res.json(formatted);
    } catch (err: any) {
      console.error('Modify order error:', err);
      return res.status(500).json({ error: 'Failed to modify order' });
    }
  });

  // Orders: Update Status (PATCH /api/orders/:id/status) - Admin Protected
  // States: pending -> preparing -> ready -> served -> completed -> cancelled
  app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }

      // Rule check: Admin can only prepare pending order after 1 minute OR if customer chose fast delivery
      if (status === 'preparing') {
        const existing = await prisma.orders.findUnique({ where: { id } });
        if (existing && existing.status === 'pending') {
          const isFast = Boolean(existing.notes?.includes('[FAST_ORDER]') || existing.notes?.includes('[NO_CHANGE]'));
          const ageSec = Math.floor((Date.now() - new Date(existing.created_at).getTime()) / 1000);
          if (ageSec < 60 && !isFast) {
            return res.status(400).json({
              error: `Customer 1-minute decision window is active (${60 - ageSec}s remaining). Please wait until the timer finishes or customer selects Fast Delivery.`
            });
          }
        }
      }

      const isCompleted = status === 'completed';

      const updated = await prisma.orders.update({
        where: { id },
        data: {
          status,
          completed: isCompleted
        },
        include: { items: true, review: true }
      });

      const formatted = attachOrderFlags(updated);
      broadcast('order:updated', formatted);
      return res.json(formatted);
    } catch (err) {
      console.error('Update status error:', err);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Orders: Complete Order (PUT & PATCH /api/orders/:id/complete) - Admin Protected
  const completeOrderHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;

      const updated = await prisma.orders.update({
        where: { id },
        data: {
          status: 'completed',
          completed: true
        },
        include: { items: true, review: true }
      });

      broadcast('order:updated', updated);
      return res.json(updated);
    } catch (err) {
      console.error('Complete order error:', err);
      return res.status(500).json({ error: 'Failed to complete order' });
    }
  };
  app.put('/api/orders/:id/complete', authenticateToken, completeOrderHandler);
  app.patch('/api/orders/:id/complete', authenticateToken, completeOrderHandler);

  // Orders: Delete/Cancel Order (DELETE /api/orders/:id) - Admin Protected
  app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.order_Items.deleteMany({ where: { order_id: id } });
      await prisma.orders.delete({ where: { id } });

      broadcast('order:deleted', { id });
      return res.json({ success: true, id });
    } catch (err) {
      console.error('Delete order error:', err);
      return res.status(500).json({ error: 'Failed to delete order' });
    }
  });

  // Waiter Calls: Call Waiter (POST /api/waiter-calls) - Public Customer
  app.post('/api/waiter-calls', async (req, res) => {
    try {
      const { table_number, reason, customer_name } = req.body;
      const call = await prisma.waiterCall.create({
        data: {
          table_number: parseInt(table_number) || 1,
          customer_name: customer_name ? String(customer_name).trim() : null,
          reason: reason || 'General Assistance',
          status: 'pending'
        }
      });

      broadcast('waiter:called', call);
      return res.status(201).json(call);
    } catch (err) {
      console.error('Waiter call error:', err);
      return res.status(500).json({ error: 'Failed to call waiter' });
    }
  });

  // Waiter Calls: List active calls (GET /api/waiter-calls) - Admin Protected
  app.get('/api/waiter-calls', authenticateToken, async (req, res) => {
    try {
      const calls = await prisma.waiterCall.findMany({
        orderBy: { created_at: 'desc' },
        take: 50
      });
      return res.json(calls);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch waiter calls' });
    }
  });

  // Waiter Calls: Attend call (PATCH /api/waiter-calls/:id/attend) - Admin Protected
  app.patch('/api/waiter-calls/:id/attend', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await prisma.waiterCall.update({
        where: { id },
        data: { status: 'attended' }
      });

      broadcast('waiter:attended', updated);
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to attend call' });
    }
  });

  // Reviews: Submit review (POST /api/reviews) - Public Customer
  app.post('/api/reviews', async (req, res) => {
    try {
      const { order_id, table_number, rating, review_text, customer_name } = req.body;
      const review = await prisma.review.create({
        data: {
          order_id: order_id || null,
          table_number: parseInt(table_number) || 1,
          customer_name: customer_name ? String(customer_name).trim() : null,
          rating: parseInt(rating) || 5,
          review_text: review_text || null
        }
      });

      broadcast('review:created', review);
      return res.status(201).json(review);
    } catch (err) {
      console.error('Review error:', err);
      return res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // Reviews: List reviews (GET /api/reviews) - Admin Protected
  app.get('/api/reviews', authenticateToken, async (req, res) => {
    try {
      const reviews = await prisma.review.findMany({
        orderBy: { created_at: 'desc' },
        take: 100
      });
      return res.json(reviews);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Sales Analytics (GET /api/analytics) - Admin Protected
  app.get('/api/analytics', authenticateToken, async (req, res) => {
    try {
      const orders = await prisma.orders.findMany({
        include: { items: true },
        orderBy: { created_at: 'asc' }
      });

      let totalRevenue = 0;
      let totalItemsSold = 0;
      const itemCounts: Record<string, { count: number; revenue: number }> = {};

      for (const order of orders) {
        if (order.status !== 'cancelled') {
          totalRevenue += order.total_amount;
        }
        for (const item of order.items) {
          totalItemsSold += item.quantity;
          if (!itemCounts[item.item_name]) {
            itemCounts[item.item_name] = { count: 0, revenue: 0 };
          }
          itemCounts[item.item_name].count += item.quantity;
          itemCounts[item.item_name].revenue += item.item_price * item.quantity;
        }
      }

      const topItems = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return res.json({
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
        totalItemsSold,
        topItems
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to compute analytics' });
    }
  });

  // Tables: Get list (GET /api/tables) - Public
  app.get('/api/tables', async (req, res) => {
    try {
      const tables = await prisma.tables.findMany({
        orderBy: { table_number: 'asc' }
      });
      return res.json(tables);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch tables' });
    }
  });

  // Tables: Add table (POST /api/tables) - Admin Protected
  app.post('/api/tables', authenticateToken, async (req, res) => {
    try {
      const { table_number } = req.body;
      const num = parseInt(table_number);
      if (isNaN(num)) {
        return res.status(400).json({ error: 'Valid table number required' });
      }

      const existing = await prisma.tables.findUnique({ where: { table_number: num } });
      if (existing) {
        return res.status(400).json({ error: `Table ${num} already exists` });
      }

      const newTable = await prisma.tables.create({
        data: {
          table_number: num,
          qr_code: `/menu?table=${num}`
        }
      });

      broadcast('table:updated', newTable);
      return res.status(201).json(newTable);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to add table' });
    }
  });

  // Tables: Delete table (DELETE /api/tables/:id) - Admin Protected
  app.delete('/api/tables/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.tables.delete({ where: { id } });

      broadcast('table:deleted', { id });
      return res.json({ success: true, id });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete table' });
    }
  });

  // Export Orders as Excel (GET /api/orders/export/today) - Admin Protected
  app.get('/api/orders/export/today', authenticateToken, async (req, res) => {
    try {
      const orders = await prisma.orders.findMany({
        include: { items: true },
        orderBy: { order_number: 'asc' }
      });

      const summaryRows: any[] = [];
      const itemizedRows: any[] = [];

      for (const order of orders) {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-IN');
        const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN');
        const itemsFormatted = order.items
          .map((i) => `${i.quantity}x ${i.item_name}${i.notes ? ` (${i.notes})` : ''}`)
          .join('; ');
        const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0);

        // Unique Order Row (Order # appears EXACTLY ONCE per order)
        summaryRows.push({
          'Order #': `#${order.order_number}`,
          'Customer Name': order.customer_name || 'Guest',
          'Customer Mobile': order.customer_phone || 'N/A',
          'Table Number': `Table ${order.table_number}`,
          'Date': orderDate,
          'Time': orderTime,
          'Items Summary': itemsFormatted,
          'Total Items': totalQuantity,
          'Total Amount (₹)': Number(order.total_amount).toFixed(2),
          'Special Instructions': order.notes || 'None',
          'Status': order.status.toUpperCase()
        });

        // Itemized Breakdown rows
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
            'Status': order.status.toUpperCase()
          });
        });
      }

      const workbook = XLSX.utils.book_new();

      // Sheet 1: Orders Summary (1 row per order - strictly unique Order #)
      const summarySheet = XLSX.utils.json_to_sheet(
        summaryRows.length > 0 ? summaryRows : [{ Message: 'No orders recorded' }]
      );
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Orders Summary');

      // Sheet 2: Itemized Breakdown
      if (itemizedRows.length > 0) {
        const itemizedSheet = XLSX.utils.json_to_sheet(itemizedRows);
        XLSX.utils.book_append_sheet(workbook, itemizedSheet, 'Itemized Breakdown');
      }

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const dateFilename = new Date().toISOString().split('T')[0];
      const fileName = `ScanDine_Hotel_Orders_${dateFilename}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (err) {
      console.error('Export Excel error:', err);
      return res.status(500).json({ error: 'Failed to generate Excel export' });
    }
  });

  // Vite Middleware / Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScanDine Server] Running on http://localhost:${PORT}`);
    console.log(`[ScanDine Auth] Protected Admin endpoint: http://localhost:${PORT}/admin`);
    console.log(`[ScanDine Menu] Customer Digital Menu: http://localhost:${PORT}/menu?table=1`);
  });
}

startServer();
