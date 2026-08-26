const db = require('../config/db');

const moreProducts = [
  {
    id: 7,
    name: 'XIV "CYBER-TRACK" Reflective Windbreaker Jacket',
    slug: 'xiv-cyber-track-reflective-windbreaker',
    sku: 'XIV-JK-007',
    categoryId: 1,
    price: 1450000,
    salePrice: 1150000,
    stock: 12,
    soldCount: 38,
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Áo khoác gió vải dù 3M phản quang trong bóng tối, cản gió và chống nước tối đa.',
    description: 'Chất liệu cao cấp co giãn 4 chiều, khóa zip 2 chiều và mũ có thể tháo rời linh hoạt.',
    tags: ['windbreaker', 'reflective', 'jacket', 'techwear'],
    isFeatured: 1
  },
  {
    id: 8,
    name: 'XIV "NIGHTFALL" Distressed Wide-Leg Denim Jeans',
    slug: 'xiv-nightfall-distressed-wide-leg-jeans',
    sku: 'XIV-DN-008',
    categoryId: 4,
    price: 1350000,
    salePrice: 990000,
    stock: 8,
    soldCount: 64,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Quần Jeans ống rộng form Baggy wash xám khói, rách gối cá tính chuẩn phong cách Y2K.',
    description: 'Chất denim 13.5oz dày dặn đứng form, giữ màu bền đẹp qua nhiều lần giặt.',
    tags: ['denim', 'jeans', 'baggy', 'y2k'],
    isFeatured: 1
  },
  {
    id: 9,
    name: 'XIV "TECH-FIGHTER" Modular Utility Tactical Vest',
    slug: 'xiv-tech-fighter-modular-utility-vest',
    sku: 'XIV-VT-009',
    categoryId: 1,
    price: 890000,
    salePrice: null,
    stock: 15,
    soldCount: 29,
    images: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Áo gile chiến thuật đa ngăn tháo rời, chất vải chống mài mòn chuẩn quân đội.',
    description: 'Phù hợp phối layer cùng áo hoodie hoặc áo thun cho outfit đậm chất Cyberpunk.',
    tags: ['vest', 'utility', 'tactical', 'layer'],
    isFeatured: 0
  },
  {
    id: 10,
    name: 'XIV "ACID GHOST" Boxy Heavy Graphic Tee',
    slug: 'xiv-acid-ghost-boxy-heavy-tee',
    sku: 'XIV-TS-010',
    categoryId: 3,
    price: 590000,
    salePrice: 390000,
    stock: 35,
    soldCount: 92,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Áo thun wash loang màu Acid bạc, họa tiết Typography Dystopian nổi 3D.',
    description: 'Form áo Boxy Fit vai rơi rộng rãi, cổ áo bo dệt 3.5cm cực kỳ cứng cáp.',
    tags: ['t-shirt', 'acid-wash', 'graphic', 'oversize'],
    isFeatured: 1
  },
  {
    id: 11,
    name: 'XIV "TOKYO DRIFT" Cyber Speed Oversize Hoodie',
    slug: 'xiv-tokyo-drift-cyber-speed-hoodie',
    sku: 'XIV-HD-011',
    categoryId: 2,
    price: 1390000,
    salePrice: 1090000,
    stock: 7,
    soldCount: 55,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Hoodie nỉ bông phối viền Neon phát quang, họa tiết Cyber Speed Racing thể thao.',
    description: 'Form rộng Oversize streetwear, túi trước bụng kangaroo tiện lợi.',
    tags: ['hoodie', 'tokyo-drift', 'neon', 'oversize'],
    isFeatured: 1
  },
  {
    id: 12,
    name: 'XIV "STEALTH" Tactical Cyber Bucket Hat',
    slug: 'xiv-stealth-tactical-cyber-bucket-hat',
    sku: 'XIV-HT-012',
    categoryId: 5,
    price: 390000,
    salePrice: 290000,
    stock: 20,
    soldCount: 88,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Nón Bucket vải dù chống nước kèm quai rút dù quân đội, logo XIV kim loại dập nổi.',
    description: 'Phụ kiện hoàn hảo che nắng và hoàn thiện set đồ đường phố.',
    tags: ['hat', 'bucket-hat', 'accessories', 'stealth'],
    isFeatured: 0
  }
];

for (const p of moreProducts) {
  db.prepare(`
    INSERT OR REPLACE INTO xiv_products (
      id, name, slug, sku, categoryId, price, salePrice, stock, soldCount,
      images, shortDescription, description, tags, isFeatured, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    p.id,
    p.name,
    p.slug,
    p.sku,
    p.categoryId,
    p.price,
    p.salePrice,
    p.stock,
    p.soldCount,
    JSON.stringify(p.images),
    p.shortDescription,
    p.description,
    JSON.stringify(p.tags),
    p.isFeatured
  );
}

const count = db.prepare('SELECT count(*) as count FROM xiv_products').get().count;
console.log(`Đã nạp thêm thành công! Tổng số sản phẩm trong kho: ${count}`);
