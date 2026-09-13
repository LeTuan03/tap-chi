import { revalidatePath } from "next/cache";

/** Làm mới cache ISR của toàn bộ site sau khi dữ liệu thay đổi từ trang quản trị */
export function revalidateSite() {
  try {
    revalidatePath("/", "layout");
  } catch {
    // Ngoài ngữ cảnh request (ví dụ khi chạy script) thì bỏ qua
  }
}
