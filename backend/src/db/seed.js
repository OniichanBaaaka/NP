const bcrypt = require('bcryptjs');

function seedDatabase(db) {
  // Kiểm tra nếu đã có dữ liệu thì không seed lại để tối ưu tốc độ và an toàn bộ nhớ
  const userCount = db.prepare('SELECT count(*) as count FROM xiv_users').get()?.count || 0;
  if (userCount > 0) {
    return;
  }

  console.log('--- Seeding Database for XIV STUDIO ---');

  const passwordAdmin = bcrypt.hashSync('admin123', 10);
  const passwordStaff = bcrypt.hashSync('staff123', 10);
  const passwordCustomer = bcrypt.hashSync('customer123', 10);

  // 1. Seed Users
  db.prepare(`
    INSERT OR IGNORE INTO xiv_users (id, name, email, password, role, phone, address, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'Admin Quản Trị',
    'admin@xivstudio.com',
    passwordAdmin,
    'admin',
    '0901234567',
    'XIV STUDIO Flagship, 14 Nguyễn Trãi, Q.1, TP.HCM',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  );

  db.prepare(`
    INSERT OR IGNORE INTO xiv_users (id, name, email, password, role, phone, address, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    2,
    'Nhân Viên Kho Vận',
    'staff@xivstudio.com',
    passwordStaff,
    'employee',
    '0907654321',
    'XIV Studio Warehouse, Tân Bình, TP.HCM',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  );

  db.prepare(`
    INSERT OR IGNORE INTO xiv_users (id, name, email, password, role, phone, address, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    3,
    'Khách Hàng Thân Thiết',
    'customer@gmail.com',
    passwordCustomer,
    'customer',
    '0988889999',
    '456 Lê Văn Sỹ, P.14, Q.3, TP.HCM',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
  );

  // 2. Seed Categories
  const categories = [
    [1, 'Outerwear & Jackets', 'outerwear', 'Áo khoác bomber, varsity phong cách cyberpunk', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'],
    [2, 'Hoodies & Sweaters', 'hoodies-sweaters', 'Heavyweight 450GSM cotton hoodies acid-wash', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    [3, 'T-Shirts & Tops', 't-shirts', 'Áo thun form boxy fit graphic typography nghệ thuật', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    [4, 'Pants & Cargo', 'pants-cargo', 'Quần cargo đa túi và parachute pants techwear', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'],
    [5, 'Accessories', 'accessories', 'Túi đeo chéo phản quang, nón beanie và thắt lưng', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80']
  ];

  for (const cat of categories) {
    db.prepare('INSERT OR IGNORE INTO xiv_categories (id, name, slug, description, image) VALUES (?, ?, ?, ?, ?)').run(...cat);
  }

  // 3. Seed Products
  const products = [
    [
      1,
      'XIV "NEO-CYBER" Acid Wash Heavyweight Hoodie',
      'xiv-neo-cyber-acid-wash-hoodie',
      'XIV-HD-001',
      2,
      1250000,
      990000,
      6, // Low stock <= 10
      48,
      JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
      ]),
      'Hoodie 450GSM nỉ bông dày dặn, xử lý màu Acid Wash độc bản phong cách Streetwear.',
      'Sản phẩm chủ đạo thuộc BST FW26 của XIV STUDIO. Sử dụng 100% Cotton 450GSM cao cấp, mũ 2 lớp đứng form.',
      JSON.stringify(['hoodie', 'acid-wash', 'oversize', 'cyberpunk']),
      1
    ],
    [
      2,
      'XIV "OVERKILL" Tactical Multi-Pocket Cargo Pants',
      'xiv-overkill-tactical-cargo-pants',
      'XIV-CG-002',
      4,
      1100000,
      null,
      18,
      32,
      JSON.stringify([
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80'
      ]),
      'Quần Cargo 8 túi tiện dụng, chất liệu Poly-Cotton chống nước nhẹ, ống rút gấu linh hoạt.',
      'Thiết kế mang hơi thở Techwear đỉnh cao với dây đai webbing điều chỉnh độ siết, khóa kéo YKK kim loại mạ đen nhám.',
      JSON.stringify(['cargo', 'techwear', 'multi-pocket', 'pants']),
      1
    ],
    [
      3,
      'XIV "METAVERSE" Boxy Fit Graphic Tee',
      'xiv-metaverse-boxy-fit-graphic-tee',
      'XIV-TS-003',
      3,
      550000,
      450000,
      25,
      110,
      JSON.stringify([
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
      ]),
      'Áo thun 250GSM 100% Compact Cotton, form Boxy Drop-shoulder tôn dáng cực chuẩn.',
      'Họa tiết in lưới Silkscreen bền màu qua 100 lần giặt. Cổ áo bo dệt 3cm không bai dão.',
      JSON.stringify(['t-shirt', 'graphic-tee', 'boxy-fit', 'streetwear']),
      1
    ],
    [
      4,
      'XIV "DARK MATTER" Reversible Bomber Jacket',
      'xiv-dark-matter-reversible-bomber-jacket',
      'XIV-JK-004',
      1,
      1850000,
      1550000,
      4, // Low stock <= 10
      21,
      JSON.stringify([
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80'
      ]),
      'Áo khoác Bomber mặc được 2 mặt: Mặt A đen nhám Tactical, Mặt B xám bạc Phản quang.',
      'Chất vải Nylon dù chống gió chống thấm nước tuyệt đối. Lớp lót trần bông quả trám giữ ấm vượt trội.',
      JSON.stringify(['bomber', 'jacket', 'reversible', 'waterproof']),
      1
    ],
    [
      5,
      'XIV "VANDALISM" Distressed Vintage Sweatshirt',
      'xiv-vandalism-distressed-vintage-sweatshirt',
      'XIV-SW-005',
      2,
      950000,
      null,
      9, // Low stock <= 10
      15,
      JSON.stringify([
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80'
      ]),
      'Sweatshirt cổ tròn mài rách thủ công từng chi tiết viền tay và gấu áo phong cách Grunge.',
      'Chất liệu da cá French Terry mềm mại, giữ nhiệt thoáng khí. Màu nhuộm Garment Dye.',
      JSON.stringify(['sweatshirt', 'vintage', 'distressed', 'grunge']),
      0
    ],
    [
      6,
      'XIV "SHADOW CROSS" Tactical Crossbody Bag',
      'xiv-shadow-cross-tactical-crossbody-bag',
      'XIV-AC-006',
      5,
      650000,
      490000,
      30,
      74,
      JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
      ]),
      'Túi đeo chéo chất liệu vải Cordura 1000D siêu bền, khóa bấm nam châm Fidlock cao cấp.',
      'Gồm 3 ngăn thông minh đựng vừa iPad Mini, điện thoại và phụ kiện. Quai đeo có đệm êm ái.',
      JSON.stringify(['bag', 'crossbody', 'cordura', 'fidlock']),
      1
    ]
  ];

  for (const prod of products) {
    db.prepare(`
      INSERT OR IGNORE INTO xiv_products (
        id, name, slug, sku, categoryId, price, salePrice, stock, soldCount,
        images, shortDescription, description, tags, isFeatured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...prod);
  }

  // 4. Seed FAQs
  const faqs = [
    [1, 'Chính sách đổi trả sản phẩm tại XIV STUDIO như thế nào?', 'XIV STUDIO hỗ trợ đổi size hoặc đổi mẫu miễn phí trong vòng 7 ngày kể từ khi nhận hàng. Yêu cầu sản phẩm còn nguyên tem mác, hóa đơn và chưa qua sử dụng.', 'policy'],
    [2, 'Hệ thống hỗ trợ những phương thức thanh toán nào?', 'Khách hàng có thể thanh toán tức thì qua Cổng VietQR Napas 247 (miễn phí giao dịch) hoặc thanh toán khi nhận hàng (COD toàn quốc).', 'payment'],
    [3, 'Thời gian giao hàng mất bao lâu?', 'Nội thành Hà Nội & TP.HCM: Giao hỏa tốc 2-4 giờ hoặc 24 giờ. Các tỉnh thành khác: 2 đến 4 ngày làm việc.', 'shipping'],
    [4, 'Làm thế nào để chọn đúng size áo/quần của XIV STUDIO?', 'Các thiết kế mang form Boxy/Oversized. Size S (48-60kg), Size M (61-72kg), Size L (73-85kg), Size XL (>85kg). Bạn có thể hỏi AI Chatbot để được tư vấn chính xác!', 'sizing']
  ];

  for (const faq of faqs) {
    db.prepare('INSERT OR IGNORE INTO xiv_faqs (id, question, answer, category) VALUES (?, ?, ?, ?)').run(...faq);
  }

  // 5. Seed Sample Orders
  db.prepare(`
    INSERT OR IGNORE INTO xiv_orders (
      id, orderCode, userId, customerInfo, items, totalAmount, paymentMethod,
      paymentStatus, orderStatus, vietqrData, statusHistory, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'XIV-2026-9812',
    3,
    JSON.stringify({
      name: 'Khách Hàng Thân Thiết',
      email: 'customer@gmail.com',
      phone: '0988889999',
      address: '456 Lê Văn Sỹ, P.14, Q.3, TP.HCM',
      note: 'Giao giờ hành chính giúp mình'
    }),
    JSON.stringify([
      {
        productId: 1,
        sku: 'XIV-HD-001',
        name: 'XIV "NEO-CYBER" Acid Wash Heavyweight Hoodie',
        price: 990000,
        quantity: 1,
        size: 'L',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
      }
    ]),
    990000,
    'vietqr',
    'paid',
    'completed',
    JSON.stringify({
      qrUrl: 'https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=990000&addInfo=XIV%20XIV-2026-9812&accountName=XIV%20STUDIO%20VIETNAM',
      accountNo: '0987654321',
      bankCode: 'MB',
      addInfo: 'XIV XIV-2026-9812',
      amount: 990000
    }),
    JSON.stringify([
      { status: 'pending', timestamp: '2026-08-25T10:00:00Z', note: 'Đơn hàng mới tạo' },
      { status: 'completed', timestamp: '2026-08-26T08:30:00Z', note: 'Khách đã nhận hàng thành công' }
    ]),
    '2026-08-25 10:00:00'
  );

  console.log('--- Seeding Completed Successfully! ---');
}

module.exports = { seedDatabase };
