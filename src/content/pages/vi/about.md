---
# Trang Giới thiệu (IA-008). Thân bài bên dưới là mục "Tôi làm gì", không dùng
# heading. Giới hạn độ dài nằm trong src/content.config.ts.

lead: "Tôi là Lê Hoàng Lâm, Software Engineer theo hướng SDET, ở TP. Hồ Chí Minh. Hiện tại, tôi đang học năm cuối ngành Công nghệ thông tin, chuyên ngành Kỹ thuật phần mềm, tại Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM."

# Mục "Cách tôi làm việc": 2–6 nguyên tắc.
principles:
  - title: "Nghiệp vụ trước"
    text: "Bắt đầu từ vấn đề cần giải quyết, rồi mới chọn công nghệ phù hợp."
  - title: "Kiến trúc vừa đủ"
    text: "Chọn giải pháp nhỏ nhất đáp ứng được ràng buộc, và ghi rõ khi nào cần xem lại."
  - title: "Rõ ràng, không thừa"
    text: "Ưu tiên code dễ đọc, có kiểu dữ liệu chặt chẽ, và chỉ thêm lớp trừu tượng khi thật sự cần."
  - title: "Bằng chứng trước khẳng định"
    text: "Kiểm chứng bằng thử nghiệm nhỏ và số đo trước khi kết luận; điều gì chưa kiểm chứng thì ghi rõ."

# Mục "Học vấn". Xoá hết các dòng thì trang ẩn cả mục.
education:
  - period: "09/2023 – 09/2027 (dự kiến)"
    title: "Công nghệ thông tin, chuyên ngành Kỹ thuật phần mềm"
    text: "Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM."
  - period: "09/2026 – nay"
    title: "Khóa luận tốt nghiệp: Towards Trustworthy AI-based API Testing"
    text: "Xây dựng framework đánh giá độ tin cậy của test API do LLM sinh ra."
---

Câu hỏi tôi quan tâm nhất là: làm sao biết phần mềm mình làm ra là đúng? Với tôi, câu trả lời trải dài suốt SDLC: bắt đầu từ những yêu cầu viết đủ rõ để kiểm thử được, đi qua các quyết định kiến trúc ghi lại thành ADR, và khép lại ở các bước kiểm tra tự động, chặn lỗi trước khi lên production.

AI agent hỗ trợ tôi ở mọi bước của SDLC lẫn STLC. Mỗi đề xuất của AI đều cần được đặt câu hỏi và kiểm chứng trước khi dùng. Khóa luận tốt nghiệp của tôi đi sâu vào chính điều này, ở dạng nghiên cứu: có tin được test API do AI sinh ra không?

Trong các dự án nhóm, tôi đảm nhận phần thiết kế và là người code chính, với TypeScript, React/Next.js, NestJS và PostgreSQL.

Chính site này cũng được làm theo cách đó: sáu quyết định kiến trúc được ghi thành ADR trước khi viết dòng code đầu tiên. Chi tiết nằm trong [case study](/projects/sojdev-site/).
