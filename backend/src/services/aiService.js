const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Product, Category, FAQ, Order } = require('../models');

const apiKey = process.env.GEMINI_API_KEY || '';
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Lấy Grounded Context từ CSDL MongoDB (Sản phẩm còn hàng, danh mục, FAQ)
 */
async function getGroundedContext() {
  const products = await Product.find().populate('categoryId', 'name slug').sort({ soldCount: -1 });
  const faqs = await FAQ.find({ isPublished: true }).sort({ displayOrder: 1 });

  return { products, faqs };
}

/**
 * Xây dựng System Instruction RAG Grounding Context cho Gemini
 */
async function buildSystemPrompt() {
  const { products, faqs } = await getGroundedContext();

  const productCatalog = products
    .map(
      (p) =>
        `- [ID: ${p._id}] [SKU: ${p.sku}] ${p.name} | Danh mục: ${p.category || (p.categoryId && p.categoryId.name) || 'Streetwear'} | Giá: ${
          p.salePrice
            ? p.salePrice.toLocaleString('vi-VN') + 'đ (Gốc ' + p.price.toLocaleString('vi-VN') + 'đ)'
            : p.price.toLocaleString('vi-VN') + 'đ'
        } | Tồn kho: ${p.stock > 0 ? p.stock + ' cái' : 'Hết hàng'} | Tóm tắt: ${p.shortDescription || p.description}`
    )
    .join('\n');

  const faqCatalog = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n---\n');

  return `Bạn là "XIV AI Assistant" - Chuyên gia phong cách thời trang Streetwear và Trợ lý Mua sắm thông minh của thương hiệu cao cấp XIV STUDIO (Việt Nam).

Dưới đây là DỮ LIỆU THỰC TẾ TRONG HỆ THỐNG KHO VÀ CHÍNH SÁCH CỦA XIV STUDIO (RAG Grounded Context):
=====================================================
DANH MỤC SẢN PHẨM HIỆN CÓ TRONG KHO:
${productCatalog}
=====================================================
CHÍNH SÁCH ĐỔI TRẢ & THANH TOÁN (FAQ):
${faqCatalog}
=====================================================

QUY TẮC PHẢN HỒI BẮT BUỘC (GROUNDING RULES):
1. Bạn CHỈ ĐƯỢC TƯ VẤN và giới thiệu các sản phẩm CÓ TRONG DANH MỤC TRÊN. Tuyệt đối không bịa đặt hoặc giới thiệu sản phẩm thương hiệu khác hoặc sản phẩm XIV không có trong kho.
2. Nếu sản phẩm hết hàng (Tồn kho: Hết hàng hoặc 0 cái), hãy thông báo khéo léo và gợi ý sản phẩm thay thế có sẵn.
3. Khi bạn đề xuất một sản phẩm cụ thể, hãy chèn cú pháp thẻ sản phẩm đặc biệt: [PRODUCT_CARD: <id>] ngay sau lời giới thiệu sản phẩm đó (Ví dụ: "Bạn có thể tham khảo mẫu áo này nhé: [PRODUCT_CARD: 67...]" hoặc SKU). Cú pháp này sẽ tự động hiển thị thẻ sản phẩm tương tác cho khách hàng.
4. Về chính sách, thanh toán (VietQR Napas 247, COD), đổi trả, thời gian giao hàng, hãy căn cứ chính xác vào FAQ ở trên.
5. Giọng điệu: Đẳng cấp, nhiệt tình, am hiểu phong cách Streetwear/Techwear/Cyberpunk, thân thiện và xưng hô "XIV STUDIO" hoặc "mình" và gọi khách là "bạn" hoặc "quý khách".`;
}

/**
 * UC006: Stream Chatbot với Google Gemini và fallback SSE streaming
 */
async function streamChatbotResponse({ messages, userQuery }, res) {
  // Chuẩn bị header SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Chống buffer trên Nginx
  });

  const systemInstruction = await buildSystemPrompt();

  // Nếu có API key và khởi tạo được Gemini SDK
  if (apiKey && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction,
      });

      // Chuyển đổi lịch sử chat cho SDK
      const contents = [];
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          if (msg.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: msg.content }] });
          } else if (msg.role === 'assistant') {
            contents.push({ role: 'model', parts: [{ text: msg.content }] });
          }
        }
      }
      // Thêm câu hỏi hiện tại nếu chưa có trong history
      if (userQuery) {
        contents.push({ role: 'user', parts: [{ text: userQuery }] });
      }

      const result = await model.generateContentStream({ contents });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (err) {
      console.warn('Gemini Live API call failed, falling back to smart simulation:', err.message);
      // Tiếp tục xuống fallback bên dưới
    }
  }

  // Smart Context-Aware Fallback Simulator (Khi chưa cấu hình GEMINI_API_KEY hoặc rate-limit)
  const { products } = await getGroundedContext();
  const lowerQuery = (userQuery || '').toLowerCase();

  let responseText = '';
  if (lowerQuery.includes('hoodie') || lowerQuery.includes('áo khoác') || lowerQuery.includes('jacket')) {
    const hoodie = products.find((p) => p.sku?.includes('HD') || p.name?.toLowerCase().includes('hoodie')) || products[0];
    responseText = `Chào bạn! Tại XIV STUDIO, các dòng áo khoác & hoodie luôn là linh hồn của bộ sưu tập FW26. 

Đặc biệt, mẫu **${hoodie?.name}** với chất liệu nỉ bông 450GSM dày dặn, xử lý màu Acid Wash độc bản đang là best-seller và chỉ còn ${hoodie?.stock} chiếc trong kho!

[PRODUCT_CARD: ${hoodie?._id || hoodie?.id}]

Ngoài ra, nếu bạn thích phong cách 2 mặt đa năng chống nước, đừng bỏ qua **XIV "DARK MATTER" Bomber Jacket**. Bạn có muốn mình tư vấn size phù hợp với chiều cao và cân nặng không ạ?`;
  } else if (lowerQuery.includes('cargo') || lowerQuery.includes('quần') || lowerQuery.includes('pants')) {
    const cargo = products.find((p) => p.sku?.includes('CG') || p.name?.toLowerCase().includes('cargo')) || products[1];
    responseText = `Dạ chào bạn! Quần tại XIV STUDIO được thiết kế chuyên biệt theo phong cách Techwear & Cyberpunk với độ hoàn thiện cực kỳ cao.

Mẫu **${cargo?.name}** trang bị 8 túi tiện dụng với đai webbing siết ống co giãn cực đỉnh:

[PRODUCT_CARD: ${cargo?._id || cargo?.id}]

Chất vải Poly-Cotton chống nước nhẹ, phối cùng sneaker hoặc boots cực kỳ chiến. Bạn có cần mình hỗ trợ chọn size theo số đo vòng eo không ạ?`;
  } else if (lowerQuery.includes('thanh toán') || lowerQuery.includes('vietqr') || lowerQuery.includes('cod')) {
    responseText = `XIV STUDIO hỗ trợ 2 phương thức thanh toán an toàn và tiện lợi nhất hiện nay:

1. **Cổng thanh toán VietQR Napas 247**: Quét mã QR tự động điền sẵn số tiền và mã đơn hàng, xác nhận tức thì trong 3 giây không tốn phí giao dịch.
2. **Thanh toán khi nhận hàng (COD)**: Khách hàng được kiểm tra hàng trước khi thanh toán trên toàn quốc.

Mọi đơn hàng từ 1.000.000đ đều được hỗ trợ freeship toàn quốc bạn nhé!`;
  } else if (lowerQuery.includes('đổi trả') || lowerQuery.includes('bảo hành') || lowerQuery.includes('size')) {
    responseText = `Chính sách chăm sóc khách hàng tại XIV STUDIO:

- **Đổi trả 7 ngày**: Hỗ trợ đổi size hoặc đổi mẫu miễn phí trong 7 ngày (giữ nguyên tag mác).
- **Form dáng**: Các sản phẩm đều là form **Boxy / Oversized**. 
  - Size S: 48kg - 60kg (<1m68)
  - Size M: 61kg - 72kg (1m68 - 1m76)
  - Size L: 73kg - 85kg (1m77 - 1m85)
  - Size XL: Trên 85kg

Bạn cho mình xin chiều cao & cân nặng để mình chọn size chuẩn nhất cho bạn nhé!`;
  } else {
    // Tổng quan gợi ý các sản phẩm nổi bật
    const p1 = products[0];
    const p2 = products[1];
    const p3 = products[2];

    responseText = `Xin chào! Mình là **XIV AI Assistant** - Trợ lý phong cách của XIV STUDIO. 

Rất vui được hỗ trợ bạn khám phá các thiết kế Streetwear cao cấp mới nhất trong BST hôm nay:

1. **${p1?.name || 'Áo Hoodie Acid Wash Neo-Cyber'}**: [PRODUCT_CARD: ${p1?._id || 1}]
2. **${p2?.name || 'Quần Cargo Tactical Multi-Pocket'}**: [PRODUCT_CARD: ${p2?._id || 2}]
3. **${p3?.name || 'Áo Thun Metaverse Boxy Fit'}**: [PRODUCT_CARD: ${p3?._id || 3}]

Bạn đang tìm kiếm trang phục cho dịp nào, hoặc cần mình tư vấn phối đồ (outfit styling) theo phong cách nào không ạ?`;
  }

  // Giả lập hiệu ứng gõ chữ qua SSE streaming
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

/**
 * UC008: AI Sinh mô tả sản phẩm chuẩn SEO cho Nhân viên (Employee)
 */
async function generateProductDescription({ name, category, material, fit, style, highlights }) {
  if (apiKey && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Bạn là chuyên gia Copywriting & SEO E-commerce cao cấp cho thương hiệu Streetwear XIV STUDIO.
Hãy tạo mô tả sản phẩm hấp dẫn và chuẩn SEO từ các thông số sau:
- Tên sản phẩm: ${name}
- Danh mục: ${category || 'Streetwear'}
- Chất liệu: ${material || 'Cotton cao cấp'}
- Form dáng: ${fit || 'Oversized / Boxy'}
- Phong cách: ${style || 'Techwear & Cyberpunk'}
- Điểm nhấn: ${highlights || 'Thiết kế độc bản'}

YÊU CẦU: Trả về duy nhất một chuỗi JSON hợp lệ (không chứa markdown \`\`\`json) với cấu trúc sau:
{
  "shortDescription": "1-2 câu tóm tắt cực chất, nêu bật chất liệu và form dáng",
  "description": "Mô tả chi tiết 2-3 đoạn về cảm hứng thiết kế, tính năng vải, độ bền, cách phối đồ",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggestedPrice": 950000
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Gemini generateProductDescription failed, fallback to template:', e.message);
    }
  }

  return {
    shortDescription: `${name} với chất liệu ${material || '100% Cotton cao cấp 450GSM'}, form dáng ${fit || 'Boxy Oversized'} chuẩn streetwear quốc tế.`,
    description: `Thuộc bộ sưu tập đương đại của XIV STUDIO, ${name} là sự kết tinh giữa tinh thần nổi loạn và tính ứng dụng cao. Được chế tác từ chất liệu ${material || 'vải dệt cao cấp'} bền bỉ, sản phẩm mang đến sự êm ái tối đa trong mọi hoạt động hàng ngày. Chi tiết ${highlights || 'đường may tỉ mỉ và phụ liệu cao cấp'} khẳng định phong cách cá nhân khác biệt của người mặc.`,
    tags: [(name || 'streetwear').toLowerCase().split(' ')[0], (fit || 'oversized').toLowerCase(), (style || 'cyberpunk').toLowerCase(), 'xiv-studio', 'vietnam-streetwear'],
    suggestedPrice: 850000,
  };
}

/**
 * UC010: AI Phân tích Chiến lược kinh doanh cho Admin
 */
async function generateStrategicAnalysis() {
  const products = await Product.find().select('name sku price stock soldCount');
  const lowStock = products.filter((p) => p.stock <= 10);

  const revenueAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'CANCELLED' } } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } },
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  const totalOrders = await Order.countDocuments();
  const bestSellers = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 3);

  const contextData = {
    totalRevenue,
    totalOrders,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock.map((p) => `${p.name} (Tồn: ${p.stock})`),
    bestSellers: bestSellers.map((p) => `${p.name} (Đã bán: ${p.soldCount})`),
  };

  if (apiKey && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Bạn là Giám đốc Chiến lược C-Level và Chuyên gia Dữ liệu Thương mại điện tử của thương hiệu thời trang XIV STUDIO.
Dựa trên dữ liệu thực tế sau:
${JSON.stringify(contextData, null, 2)}

Hãy đưa ra một bản Báo cáo Phân tích Chiến lược kinh doanh cấp cao với cấu trúc:
1. Đánh giá tổng quan hiệu suất (Doanh thu & Số lượng đơn)
2. Cảnh báo rủi ro đứt gãy chuỗi cung ứng (Sản phẩm tồn kho thấp <= 10 chiếc)
3. Đề xuất chiến lược tăng trưởng & chiến dịch Flash Sale / Pre-order
4. Dự báo xu hướng và phân bổ ngân sách marketing

Định dạng văn bản dạng Markdown chuyên nghiệp, có bullet points và số liệu minh chứng.`;

      const result = await model.generateContent(prompt);
      return {
        success: true,
        analysis: result.response.text(),
        kpiSummary: contextData,
      };
    } catch (e) {
      console.warn('Gemini generateStrategicAnalysis failed, using template:', e.message);
    }
  }

  // Fallback thông minh chi tiết
  const analysisReport = `## 📊 BÁO CÁO CHIẾN LƯỢC KINH DOANH & TỐI ƯU HÓA KHO VẬN - XIV STUDIO

### 1. 📈 Đánh giá Hiệu suất Kinh doanh Tổng quan
- **Tổng doanh thu thực đạt:** ${totalRevenue.toLocaleString('vi-VN')} VNĐ qua **${totalOrders}** đơn hàng.
- **Top 1 Sản phẩm bán chạy nhất:** **${bestSellers[0]?.name || 'Áo Hoodie Neo-Cyber'}** với ${bestSellers[0]?.soldCount || 48} sản phẩm đã bán ra.

### 2. ⚠️ Cảnh báo Đứt gãy Chuỗi Cung ứng (Tồn kho thấp $\\le 10$)
Hiện tại có **${lowStock.length} sản phẩm** đang ở mức tồn kho nguy hiểm:
${lowStock.map((p) => `- 🔴 **${p.name}** (SKU: \`${p.sku}\`): Còn lại **${p.stock} sản phẩm**`).join('\n')}

**Hành động khẩn cấp:** Đề xuất bộ phận Kho vận kích hoạt lệnh sản xuất bổ sung đợt 2 ngay trong 48 giờ tới để tránh bỏ lỡ cơ hội bán hàng.

### 3. 🎯 Đề xuất Chiến dịch Tăng trưởng Q3/Q4
- **Chiến lược Pre-order:** Mở cổng đặt trước cho dòng **${lowStock[0]?.name || 'Áo khoác Bomber'}** kèm ưu đãi 10% khi thanh toán bằng **VietQR**.
- **Bundle Combo:** Đẩy mạnh combo **Áo Thun Metaverse + Quần Cargo Overkill** để tăng giá trị trung bình trên mỗi đơn hàng (AOV) lên trên 1.500.000đ.
- **Tối ưu hóa Chi phí:** Thanh toán VietQR Napas 247 đang giúp tiết kiệm 1.5% phí trung gian cổng thanh toán so với thẻ quốc tế.

### 4. 🤖 Khuyến nghị Phân bổ Ngân sách Tiếp thị
Tập trung 60% ngân sách quảng cáo vào các tệp khách hàng yêu thích phong cách Streetwear Techwear trên TikTok/Instagram Reels nhằm khai thác tối đa tệp khách hàng Gen Z.`;

  return {
    success: true,
    analysis: analysisReport,
    kpiSummary: contextData,
  };
}

module.exports = {
  getGroundedContext,
  buildSystemPrompt,
  streamChatbotResponse,
  generateProductDescription,
  generateStrategicAnalysis,
};
