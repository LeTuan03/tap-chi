/** Nhúng dữ liệu có cấu trúc schema.org (JSON-LD) */
export default function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON-LD là dữ liệu do server sinh ra, escape "<" để an toàn khi nhúng trong HTML
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
