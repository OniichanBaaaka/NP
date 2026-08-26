const db = require('../config/db');

console.log('--- Đang thêm Danh Mục & Sản Phẩm mới cho XIV STUDIO ---');

// 1. Thêm 3 Danh mục mới
const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO xiv_categories (id, name, slug, description, image)
  VALUES (@id, @name, @slug, @description, @image)
`);

const newCategories = [
  {
    id: 6,
    name: 'Giày Sneaker & Boots',
    slug: 'footwear-sneakers',
    description: 'Giày Chunky Sneaker phản quang và Combat Boots phong cách tương lai',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    name: 'Túi & Phụ Kiện',
    slug: 'headwear-accessories',
    description: 'Túi đeo chéo chiến thuật, nón bucket và kính mát Cyberpunk',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    name: 'Trang Sức Titan Cyber',
    slug: 'jewelry-cyber',
    description: 'Dây chuyền, nhẫn và vòng tay hợp kim titan không gỉ cao cấp',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  },
];

newCategories.forEach((c) => {
  insertCategory.run(c);
  console.log(`✓ Đã thêm/cập nhật danh mục: ${c.name}`);
});

// 2. Thêm 8 Sản phẩm mới
const insertProduct = db.prepare(`
  INSERT OR REPLACE INTO xiv_products (
    id, name, slug, sku, categoryId, price, salePrice,
    stock, soldCount, images, shortDescription, description, tags, isFeatured
  ) VALUES (
    @id, @name, @slug, @sku, @categoryId, @price, @salePrice,
    @stock, @soldCount, @images, @shortDescription, @description, @tags, @isFeatured
  )
`);

const newProducts = [
  {
    id: 13,
    name: 'XIV "CYBER-RUNNER" Chunky Sneaker V1',
    slug: 'xiv-cyber-runner-chunky-sneaker-v1',
    sku: 'XIV-FTW-013',
    categoryId: 6,
    price: 1850000,
    salePrice: 1490000,
    stock: 8,
    soldCount: 42,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Giày Chunky Sneaker thiết kế tương lai với đế đệm khí Air-Cushion 5cm và chi tiết 3M phản quang trong đêm.',
    description: 'XIV "CYBER-RUNNER" Chunky Sneaker V1 là bước đột phá kết hợp giữa kiến trúc tương lai và công nghệ đệm êm ái.\n- Thân giày: Vải lưới thoáng khí kết hợp da Microfiber chống nhăn.\n- Đế giày: Cao su đúc nguyên khối chống trượt, tăng chiều cao tự nhiên 5cm.\n- Điểm nhấn: Dây buộc phản quang 3M Scotchlite phát sáng rực rỡ dưới ánh đèn đêm.',
    tags: JSON.stringify(['sneaker', 'chunky', 'footwear', 'flashsale', 'new']),
    isFeatured: 1,
  },
  {
    id: 14,
    name: 'XIV "DYSTOPIA" Combat Tactical High Boots',
    slug: 'xiv-dystopia-combat-tactical-high-boots',
    sku: 'XIV-FTW-014',
    categoryId: 6,
    price: 2200000,
    salePrice: 1890000,
    stock: 5,
    soldCount: 29,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Giày Combat Boots cổ cao chiến thuật, khóa kéo kim loại YKK bên hông tháo mở nhanh 2 giây.',
    description: 'Giày Combat Boots đậm chất Dystopian Techwear mang lại vẻ ngoài cực ngầu cho mọi outfit streetwear.\n- Chất liệu: Da bò nappa phủ sáp mờ kháng nước 100%.\n- Thiết kế: Cổ cao ôm chân, tích hợp khóa kéo YKK tiện lợi.\n- Khối lượng: Tối ưu nhẹ hơn 30% so với boots truyền thống.',
    tags: JSON.stringify(['boots', 'tactical', 'dystopia', 'footwear']),
    isFeatured: 1,
  },
  {
    id: 15,
    name: 'XIV "STEALTH-01" Modular Crossbody Bag',
    slug: 'xiv-stealth-01-modular-crossbody-bag',
    sku: 'XIV-ACC-015',
    categoryId: 7,
    price: 650000,
    salePrice: 490000,
    stock: 15,
    soldCount: 88,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Túi đeo chéo mô-đun chống thấm Cordura 1000D với khóa từ tính Fidlock đóng mở cực mượt.',
    description: 'Túi đeo chéo chiến thuật đa năng chứa vừa iPad 11 inch, điện thoại, ví và sạc dự phòng.\n- Vải Cordura 1000D chống mài mòn, chống rạch.\n- Khóa nam châm hít tự động Fidlock Đức.\n- Quai đeo bản rộng trợ lực vai êm ái.',
    tags: JSON.stringify(['bag', 'crossbody', 'accessories', 'bestseller']),
    isFeatured: 1,
  },
  {
    id: 16,
    name: 'XIV "TITAN-CHAIN" Cyberpunk Pendant Necklace',
    slug: 'xiv-titan-chain-cyberpunk-pendant-necklace',
    sku: 'XIV-JWL-016',
    categoryId: 8,
    price: 490000,
    salePrice: 350000,
    stock: 20,
    soldCount: 115,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591475155-4286fafb33e6?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Dây chuyền mặt hình khối vi mạch Cyberpunk chế tác từ Titan G5 nguyên khối không rỉ sét, vĩnh cửu.',
    description: 'Phụ kiện tạo điểm nhấn hoàn hảo cho các set đồ Oversize Hoodie và Cyberpunk Tee.\n- Chất liệu Titan G5 chuẩn hàng không, không kích ứng da, không phai màu.\n- Khắc laser tinh xảo logo XIV STUDIO số lượng giới hạn.',
    tags: JSON.stringify(['jewelry', 'necklace', 'titanium', 'cyberpunk']),
    isFeatured: 1,
  },
  {
    id: 17,
    name: 'XIV "PHANTOM" Distressed Biker Leather Jacket',
    slug: 'xiv-phantom-distressed-biker-leather-jacket',
    sku: 'XIV-JKT-017',
    categoryId: 1,
    price: 2450000,
    salePrice: 1850000,
    stock: 4,
    soldCount: 38,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Áo khoác da Biker xử lý mài xước thủ công phong cách Rock Grunge Vintage cao cấp.',
    description: 'Thiết kế Áo khoác da dáng Boxy tôn dáng đỉnh cao, lót trong lụa satin mượt mát và khóa kéo kim loại cổ điển.',
    tags: JSON.stringify(['jacket', 'leather', 'outerwear', 'biker', 'luxury']),
    isFeatured: 1,
  },
  {
    id: 18,
    name: 'XIV "NIGHT-CRAWLER" Multi-Pocket Cargo Pants V2',
    slug: 'xiv-night-crawler-multi-pocket-cargo-pants-v2',
    sku: 'XIV-PNT-018',
    categoryId: 4,
    price: 1100000,
    salePrice: 850000,
    stock: 9,
    soldCount: 64,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Quần túi hộp 8 ngăn công nghệ Techwear, cạp chun co giãn kèm đai thắt khóa bấm kim loại.',
    description: 'Phiên bản V2 nâng cấp chất vải Khaki Cotton Twill 380gsm dày dặn, đứng form và kháng nhăn tuyệt đối.',
    tags: JSON.stringify(['pants', 'cargo', 'techwear', 'hot']),
    isFeatured: 1,
  },
  {
    id: 19,
    name: 'XIV "NEON-MATRIX" Boxy Heavyweight Graphic Tee',
    slug: 'xiv-neon-matrix-boxy-heavyweight-graphic-tee',
    sku: 'XIV-TEE-019',
    categoryId: 3,
    price: 550000,
    salePrice: 420000,
    stock: 18,
    soldCount: 140,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Áo thun 100% Cotton 250gsm in kỹ thuật số công nghệ cao phủ dạ quang phát sáng tia UV.',
    description: 'Form áo Boxy Châu Âu cổ dày 3cm chống dão, hình in Cyber Matrix sắc nét không bong tróc sau 100 lần giặt.',
    tags: JSON.stringify(['tshirt', 'graphic', 'neon', 'bestseller']),
    isFeatured: 1,
  },
  {
    id: 20,
    name: 'XIV "CYBER-PULSE" Futuristic Sunglasses',
    slug: 'xiv-cyber-pulse-futuristic-sunglasses',
    sku: 'XIV-ACC-020',
    categoryId: 7,
    price: 450000,
    salePrice: 320000,
    stock: 12,
    soldCount: 76,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
    ]),
    shortDescription: 'Kính mát chống tia UV400 phong cách Y2K Cyberpunk với gọng kim loại nguyên khối mạ bạc.',
    description: 'Tròng kính tráng gương phân cực chống chói, bảo vệ mắt tuyệt đối dưới ánh nắng gay gắt.',
    tags: JSON.stringify(['glasses', 'sunglasses', 'cyberpunk', 'accessories']),
    isFeatured: 1,
  },
];

newProducts.forEach((p) => {
  insertProduct.run(p);
  console.log(`✓ Đã thêm/cập nhật sản phẩm: ID ${p.id} - ${p.name}`);
});

console.log('--- HOÀN TẤT BỔ SUNG 8 SẢN PHẨM & 3 DANH MỤC MỚI ---');
