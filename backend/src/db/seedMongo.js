require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { User, Product, Category, Order, FAQ, Cart, Wishlist } = require('../models');

async function seedMongoDB() {
  await connectDB();

  console.log('🚀 --- Bắt đầu Khởi tạo Cơ sở dữ liệu MongoDB (XIV STUDIO) ---');

  // 1. Xóa dữ liệu cũ để tránh trùng lặp
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Order.deleteMany({}),
    FAQ.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);

  console.log('✓ Đã làm sạch các Collection cũ.');

  // 2. Seed Users
  const passwordAdmin = bcrypt.hashSync('admin123', 10);
  const passwordStaff = bcrypt.hashSync('staff123', 10);
  const passwordCustomer = bcrypt.hashSync('customer123', 10);

  const users = await User.insertMany([
    {
      name: 'Admin Quản Trị',
      email: 'admin@xivstudio.com',
      password: passwordAdmin,
      role: 'admin',
      phone: '0901234567',
      address: 'XIV STUDIO Flagship, 14 Nguyễn Trãi, Q.1, TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      totalSpent: 15500000,
      activePackage: 'XIV_GOD',
      membershipTier: 'DIAMOND',
    },
    {
      name: 'Nhân Viên Kho Vận',
      email: 'staff@xivstudio.com',
      password: passwordStaff,
      role: 'employee',
      phone: '0907654321',
      address: 'XIV Studio Warehouse, Tân Bình, TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      totalSpent: 2400000,
      activePackage: 'NONE',
      membershipTier: 'SILVER',
    },
    {
      name: 'Khách Hàng Thân Thiết',
      email: 'customer@gmail.com',
      password: passwordCustomer,
      role: 'customer',
      phone: '0988889999',
      address: '456 Lê Văn Sỹ, P.14, Q.3, TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      totalSpent: 4850000,
      activePackage: 'CYBER_VIP',
      membershipTier: 'GOLD',
    },
  ]);
  console.log(`✓ Đã tạo ${users.length} người dùng (Admin, Employee, Customer).`);

  // 3. Seed Categories
  const categoryData = [
    {
      name: 'Outerwear & Jackets',
      slug: 'outerwear',
      description: 'Áo khoác bomber, varsity và áo khoác gió phản quang phong cách cyberpunk',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
    },
    {
      name: 'Hoodies & Sweaters',
      slug: 'hoodies-sweaters',
      description: 'Heavyweight 450GSM cotton hoodies acid-wash độc bản',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
    },
    {
      name: 'T-Shirts & Tops',
      slug: 't-shirts',
      description: 'Áo thun form boxy fit graphic typography nghệ thuật đường phố',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
    },
    {
      name: 'Pants & Cargo',
      slug: 'pants-cargo',
      description: 'Quần cargo đa túi chiến thuật và parachute pants techwear',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Túi đeo chéo phản quang, nón beanie và phụ kiện thời trang cao cấp',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
    },
    {
      name: 'Giày Sneaker & Boots',
      slug: 'footwear-sneakers',
      description: 'Giày Chunky Sneaker phản quang và Combat Boots phong cách tương lai',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
      displayOrder: 6,
    },
    {
      name: 'Túi & Phụ Kiện',
      slug: 'headwear-accessories',
      description: 'Túi đeo chéo chiến thuật, nón bucket và kính mát Cyberpunk',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      displayOrder: 7,
    },
    {
      name: 'Trang Sức Titan Cyber',
      slug: 'jewelry-cyber',
      description: 'Dây chuyền, nhẫn và vòng tay hợp kim titan không gỉ cao cấp',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
      displayOrder: 8,
    },
  ];

  const categories = await Category.insertMany(categoryData);
  console.log(`✓ Đã tạo ${categories.length} danh mục sản phẩm.`);

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  // 4. Seed Products
  const productsData = [
    {
      name: 'XIV "NEO-CYBER" Acid Wash Heavyweight Hoodie',
      sku: 'XIV-HD-001',
      categoryId: catMap['hoodies-sweaters'],
      category: 'Hoodies & Sweaters',
      price: 1250000,
      salePrice: 990000,
      stock: 6,
      soldCount: 48,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
      ],
      shortDescription: 'Hoodie 450GSM nỉ bông dày dặn, xử lý màu Acid Wash độc bản phong cách Streetwear.',
      description: 'Sản phẩm chủ đạo thuộc BST FW26 của XIV STUDIO. Sử dụng 100% Cotton 450GSM cao cấp, mũ 2 lớp đứng form.',
      tags: ['hoodie', 'acid-wash', 'oversize', 'cyberpunk'],
      isNewProduct: true,
      isTrending: true,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Acid Wash Black', 'Smoke Grey'],
      material: '100% French Terry Cotton 450GSM',
      fit: 'Boxy Oversized',
      style: 'Cyberpunk Streetwear',
    },
    {
      name: 'XIV "OVERKILL" Tactical Multi-Pocket Cargo Pants',
      sku: 'XIV-CG-002',
      categoryId: catMap['pants-cargo'],
      category: 'Pants & Cargo',
      price: 1100000,
      salePrice: null,
      stock: 18,
      soldCount: 32,
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
      ],
      shortDescription: 'Quần Cargo 8 túi tiện dụng, chất liệu Poly-Cotton chống nước nhẹ, ống rút gấu linh hoạt.',
      description: 'Thiết kế mang hơi thở Techwear đỉnh cao với dây đai webbing điều chỉnh độ siết, khóa kéo YKK kim loại mạ đen nhám.',
      tags: ['cargo', 'techwear', 'multi-pocket', 'pants'],
      isNewProduct: true,
      isTrending: true,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Tactical Black', 'Olive Green'],
      material: '65% Cotton, 35% Poly kháng nước',
      fit: 'Relaxed Fit',
      style: 'Techwear',
    },
    {
      name: 'XIV "METAVERSE" Boxy Fit Graphic Tee',
      sku: 'XIV-TS-003',
      categoryId: catMap['t-shirts'],
      category: 'T-Shirts & Tops',
      price: 550000,
      salePrice: 450000,
      stock: 25,
      soldCount: 110,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      ],
      shortDescription: 'Áo thun 250GSM 100% Compact Cotton, form Boxy Drop-shoulder tôn dáng cực chuẩn.',
      description: 'Họa tiết in lưới Silkscreen bền màu qua 100 lần giặt. Cổ áo bo dệt 3cm không bai dão.',
      tags: ['t-shirt', 'graphic-tee', 'boxy-fit', 'streetwear'],
      isNewProduct: false,
      isTrending: true,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Off-White'],
      material: '100% Compact Cotton 250GSM',
      fit: 'Boxy Drop Shoulder',
      style: 'Dystopian Graphic',
    },
    {
      name: 'XIV "DARK MATTER" Reversible Bomber Jacket',
      sku: 'XIV-JK-004',
      categoryId: catMap['outerwear'],
      category: 'Outerwear & Jackets',
      price: 1850000,
      salePrice: 1550000,
      stock: 4,
      soldCount: 21,
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      ],
      shortDescription: 'Áo khoác Bomber mặc được 2 mặt: Mặt A đen nhám Tactical, Mặt B xám bạc Phản quang.',
      description: 'Chất vải Nylon dù chống gió chống thấm nước tuyệt đối. Lớp lót trần bông quả trám giữ ấm vượt trội.',
      tags: ['bomber', 'jacket', 'reversible', 'waterproof'],
      isNewProduct: true,
      isTrending: false,
      sizes: ['M', 'L', 'XL'],
      colors: ['Matte Black / Reflective Silver'],
      material: 'Tactical High-Density Nylon',
      fit: 'Oversized Bomber',
      style: 'Techwear Outerwear',
    },
    {
      name: 'XIV "VANDALISM" Distressed Vintage Sweatshirt',
      sku: 'XIV-SW-005',
      categoryId: catMap['hoodies-sweaters'],
      category: 'Hoodies & Sweaters',
      price: 950000,
      salePrice: null,
      stock: 9,
      soldCount: 15,
      images: [
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
      ],
      shortDescription: 'Sweatshirt cổ tròn mài rách thủ công từng chi tiết viền tay và gấu áo phong cách Grunge.',
      description: 'Chất liệu da cá French Terry mềm mại, giữ nhiệt thoáng khí. Màu nhuộm Garment Dye.',
      tags: ['sweatshirt', 'vintage', 'distressed', 'grunge'],
      isNewProduct: false,
      isTrending: false,
      sizes: ['M', 'L', 'XL'],
      colors: ['Washed Charcoal'],
      material: '100% French Terry Cotton',
      fit: 'Relaxed Fit',
      style: 'Vintage Grunge',
    },
    {
      name: 'XIV "SHADOW CROSS" Tactical Crossbody Bag',
      sku: 'XIV-AC-006',
      categoryId: catMap['accessories'],
      category: 'Accessories',
      price: 650000,
      salePrice: 490000,
      stock: 30,
      soldCount: 74,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      ],
      shortDescription: 'Túi đeo chéo chất liệu vải Cordura 1000D siêu bền, khóa bấm nam châm Fidlock cao cấp.',
      description: 'Gồm 3 ngăn thông minh đựng vừa iPad Mini, điện thoại và phụ kiện. Quai đeo có đệm êm ái.',
      tags: ['bag', 'crossbody', 'cordura', 'fidlock'],
      isNewProduct: false,
      isTrending: true,
      sizes: ['Free Size'],
      colors: ['Stealth Black'],
      material: 'Cordura 1000D Waterproof',
      fit: 'Adjustable Strap',
      style: 'Utility Crossbody',
    },
    {
      name: 'XIV "CYBER-RUNNER" Chunky Sneaker V1',
      sku: 'XIV-FTW-013',
      categoryId: catMap['footwear-sneakers'],
      category: 'Giày Sneaker & Boots',
      price: 1850000,
      salePrice: 1490000,
      stock: 8,
      soldCount: 42,
      images: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      ],
      shortDescription: 'Giày Chunky Sneaker thiết kế tương lai với đế đệm khí Air-Cushion 5cm và chi tiết 3M phản quang trong đêm.',
      description: 'XIV "CYBER-RUNNER" Chunky Sneaker V1 là bước đột phá kết hợp giữa kiến trúc tương lai và công nghệ đệm êm ái.\n- Thân giày: Vải lưới thoáng khí kết hợp da Microfiber chống nhăn.\n- Đế giày: Cao su đúc nguyên khối chống trượt, tăng chiều cao tự nhiên 5cm.\n- Điểm nhấn: Dây buộc phản quang 3M Scotchlite phát sáng rực rỡ dưới ánh đèn đêm.',
      tags: ['sneaker', 'chunky', 'footwear', 'flashsale', 'new'],
      isNewProduct: true,
      isTrending: true,
      sizes: ['39', '40', '41', '42', '43'],
      colors: ['Cyber Neon', 'Triple Black'],
      material: 'Microfiber Leather & Breathable Mesh',
      fit: 'True to Size',
      style: 'Cyber Chunky',
    },
    {
      name: 'XIV "DYSTOPIA" Combat Tactical High Boots',
      sku: 'XIV-FTW-014',
      categoryId: catMap['footwear-sneakers'],
      category: 'Giày Sneaker & Boots',
      price: 2200000,
      salePrice: 1890000,
      stock: 5,
      soldCount: 29,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
      ],
      shortDescription: 'Giày Combat Boots cổ cao chiến thuật, khóa kéo kim loại YKK bên hông tháo mở nhanh 2 giây.',
      description: 'Giày Combat Boots đậm chất Dystopian Techwear mang lại vẻ ngoài cực ngầu cho mọi outfit streetwear.\n- Chất liệu: Da bò nappa phủ sáp mờ kháng nước 100%.\n- Thiết kế: Cổ cao ôm chân, tích hợp khóa kéo YKK tiện lợi.\n- Khối lượng: Tối ưu nhẹ hơn 30% so với boots truyền thống.',
      tags: ['boots', 'tactical', 'dystopia', 'footwear'],
      isNewProduct: true,
      isTrending: false,
      sizes: ['40', '41', '42', '43'],
      colors: ['Matte Black'],
      material: 'Nappa Waxed Leather',
      fit: 'Combat Fit',
      style: 'Dystopian Boots',
    },
  ];

  const products = await Product.insertMany(productsData);
  console.log(`✓ Đã tạo ${products.length} sản phẩm thời trang cao cấp.`);

  // 5. Seed FAQs
  const faqsData = [
    {
      question: 'Chính sách đổi trả sản phẩm tại XIV STUDIO như thế nào?',
      answer: 'XIV STUDIO hỗ trợ đổi size hoặc đổi mẫu miễn phí trong vòng 7 ngày kể từ khi nhận hàng. Yêu cầu sản phẩm còn nguyên tem mác, hóa đơn và chưa qua sử dụng.',
      category: 'RETURN',
      isPublished: true,
      displayOrder: 1,
    },
    {
      question: 'Hệ thống hỗ trợ những phương thức thanh toán nào?',
      answer: 'Khách hàng có thể thanh toán tức thì qua Cổng VietQR Napas 247 (miễn phí giao dịch, tự động khớp mã đơn) hoặc thanh toán khi nhận hàng (COD toàn quốc).',
      category: 'PAYMENT',
      isPublished: true,
      displayOrder: 2,
    },
    {
      question: 'Thời gian giao hàng mất bao lâu?',
      answer: 'Nội thành Hà Nội & TP.HCM: Giao hỏa tốc 2-4 giờ hoặc 24 giờ. Các tỉnh thành khác: 2 đến 4 ngày làm việc.',
      category: 'SHIPPING',
      isPublished: true,
      displayOrder: 3,
    },
    {
      question: 'Làm thế nào để chọn đúng size áo/quần của XIV STUDIO?',
      answer: 'Các thiết kế mang form Boxy/Oversized. Size S (48-60kg), Size M (61-72kg), Size L (73-85kg), Size XL (>85kg). Bạn có thể trò chuyện với AI Chatbot để được tư vấn kích cỡ chuẩn nhất!',
      category: 'PRODUCT',
      isPublished: true,
      displayOrder: 4,
    },
    {
      question: 'Chính sách thẻ Hội Viên và Tích Điểm VIP tại XIV STUDIO?',
      answer: 'Khách hàng mua sắm sẽ được thăng hạng từ MEMBER -> SILVER (5M) -> GOLD (15M) -> DIAMOND (30M) với ưu đãi giảm giá trọn đời lên đến 20% cùng voucher sinh nhật độc quyền.',
      category: 'MEMBERSHIP',
      isPublished: true,
      displayOrder: 5,
    },
  ];

  const faqs = await FAQ.insertMany(faqsData);
  console.log(`✓ Đã tạo ${faqs.length} câu hỏi FAQ hỗ trợ RAG AI.`);

  // 6. Seed Sample Order
  const customerUser = users[2];
  const sampleProduct = products[0];

  const sampleOrder = await Order.create({
    orderCode: 'XIV-2026-9812',
    userId: customerUser._id,
    customerName: customerUser.name,
    customerEmail: customerUser.email,
    customerPhone: customerUser.phone,
    shippingAddress: customerUser.address,
    items: [
      {
        productId: sampleProduct._id,
        sku: sampleProduct.sku,
        name: sampleProduct.name,
        price: sampleProduct.salePrice || sampleProduct.price,
        quantity: 1,
        size: 'L',
        color: 'Acid Wash Black',
        image: sampleProduct.images[0] || '',
      },
    ],
    totalAmount: sampleProduct.salePrice || sampleProduct.price,
    discountAmount: 0,
    finalAmount: sampleProduct.salePrice || sampleProduct.price,
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    note: 'Giao giờ hành chính giúp mình nhé!',
    timeline: [
      {
        status: 'PENDING',
        time: new Date(Date.now() - 86400000 * 2),
        description: 'Đơn hàng được khởi tạo qua VietQR',
      },
      {
        status: 'PROCESSING',
        time: new Date(Date.now() - 86400000 * 1.5),
        description: 'Kho đã đóng gói đơn hàng',
      },
      {
        status: 'SHIPPING',
        time: new Date(Date.now() - 86400000 * 1),
        description: 'Đơn vị vận chuyển đang phát hàng',
      },
      {
        status: 'DELIVERED',
        time: new Date(Date.now() - 86400000 * 0.2),
        description: 'Khách hàng đã nhận hàng thành công',
      },
    ],
  });

  console.log(`✓ Đã tạo đơn hàng mẫu: ${sampleOrder.orderCode} (Trạng thái: DELIVERED).`);

  // 7. Seed Cart & Wishlist
  await Cart.create({
    userId: customerUser._id,
    items: [
      {
        productId: products[1]._id,
        sku: products[1].sku,
        name: products[1].name,
        price: products[1].price,
        salePrice: products[1].salePrice,
        quantity: 1,
        size: 'M',
        color: 'Tactical Black',
        image: products[1].images[0],
        stock: products[1].stock,
      },
    ],
  });

  await Wishlist.create({
    userId: customerUser._id,
    products: [
      { productId: products[0]._id },
      { productId: products[2]._id },
    ],
  });

  console.log('✓ Đã khởi tạo giỏ hàng và danh sách yêu thích cho tài khoản mẫu.');

  console.log('🎉 --- Khởi tạo dữ liệu MongoDB thành công mỹ mãn! ---');
  process.exit(0);
}

seedMongoDB().catch((err) => {
  console.error('❌ Lỗi khi seed MongoDB:', err);
  process.exit(1);
});
