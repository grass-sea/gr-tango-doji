# N3 Mimikara – Học từ vựng

Ứng dụng web tĩnh (HTML, CSS, JavaScript thuần), không cần cài thư viện hay build.

## Cấu trúc
| File | Nội dung |
|---|---|
| `index.html` | Trang chính, nạp các file còn lại |
| `style.css` | Giao diện (màu, nền, bố cục, bản cho điện thoại ở cuối file) |
| `app.js` | Toàn bộ logic: gõ romaji, chấm đúng sai, ôn lặp lại, thư viện bộ từ |
| `data/mimikara.js` | 880 từ Mimikara N3, mỗi từ một dòng |
| `sw.js`, `manifest.webmanifest`, `icon*` | Cài lên điện thoại và học khi mất mạng |

## Mở và sửa bằng VS Code
1. Giải nén, mở thư mục bằng VS Code (File → Open Folder).
2. Cài tiện ích **Live Server**, chuột phải `index.html` → *Open with Live Server*. Trang tự tải lại mỗi khi lưu file.
3. Cũng có thể nhấp đúp `index.html` để mở thẳng (chỉ khác là chưa dùng được chế độ cài lên điện thoại).

Chỗ hay sửa:
- Thêm hoặc sửa từ Mimikara: `data/mimikara.js` (ghi chú cấu trúc ở đầu file).
- Màu sắc, nền: các biến `--ac`, `--shu`, `--bg`... ở đầu `style.css`.
- Ngày thi và ngày bắt đầu lịch: tìm `new Date(2026,9,22)` và `new Date(2026,11,6)` trong `app.js` (tháng tính từ 0).
- Bộ từ riêng (IT, v.v.) nên thêm bằng chức năng dán bảng trong app, không cần sửa code.

## Đưa lên mạng để mở trên điện thoại (miễn phí)
Chọn một cách:
- **Netlify Drop** (nhanh nhất): vào app.netlify.com/drop, kéo cả thư mục dự án thả vào, nhận link `https://...netlify.app`.
- **GitHub Pages**: tạo repo, đẩy các file lên, vào *Settings → Pages*, chọn nhánh `main`, thư mục `/ (root)`.
- **Cloudflare Pages**: kết nối repo hoặc tải thư mục lên.

Cập nhật: sửa file rồi tải lại lên chỗ đã chọn (hoặc `git push`). Nếu đã cài trên điện thoại mà chưa thấy bản mới, mở app lúc có mạng rồi kéo tải lại; khi đổi lớn có thể tăng `V` trong `sw.js` (ví dụ `n3vocab-v2`).

## Dùng trên điện thoại
1. Mở link trên trình duyệt điện thoại.
2. iPhone (Safari): nút Chia sẻ → *Thêm vào MH chính*. Android (Chrome): menu ⋮ → *Cài đặt ứng dụng* hoặc *Thêm vào màn hình chính*.
3. Sau khi cài, app mở như ứng dụng và học được cả khi mất mạng.

## Tiến độ học
Tiến độ và bộ từ tự thêm được lưu trong trình duyệt, **riêng cho từng thiết bị và từng địa chỉ web**. Điện thoại và laptop không tự đồng bộ. Để chuyển: ở màn hình Thư viện, mục *Sao lưu toàn bộ thư viện* → Xuất, chép đoạn chữ, rồi dán vào ô và bấm Nhập trên máy kia (gửi qua Zalo, ghi chú... đều được).
