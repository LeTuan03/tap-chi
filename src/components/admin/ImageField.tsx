"use client";

import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { App, Button, Input, Space, Upload } from "antd";

interface Props {
  value?: string;
  onChange?: (url: string) => void;
}

/** Trường ảnh: tải lên hoặc dán URL, có xem trước. Dùng trong Form.Item (value/onChange). */
export default function ImageField({ value = "", onChange }: Props) {
  const { message } = App.useApp();
  return (
    <div className="image-field">
      <div className="image-field__preview">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Xem trước" />
        ) : (
          <span>Chưa có ảnh</span>
        )}
      </div>
      <Space.Compact style={{ width: "100%" }}>
        <Input value={value} placeholder="Dán URL ảnh hoặc tải lên" onChange={(e) => onChange?.(e.target.value)} allowClear />
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={async ({ file, onSuccess, onError }) => {
            const form = new FormData();
            form.append("file", file as File);
            try {
              const res = await fetch("/api/admin/upload", { method: "POST", body: form });
              const data = (await res.json()) as { url?: string; error?: string };
              if (!res.ok || !data.url) throw new Error(data.error || "Tải ảnh thất bại");
              onChange?.(data.url);
              message.success("Đã tải ảnh lên");
              onSuccess?.(data);
            } catch (e) {
              message.error((e as Error).message);
              onError?.(e as Error);
            }
          }}
        >
          <Button icon={<UploadOutlined />}>Tải lên</Button>
        </Upload>
        {value && <Button icon={<DeleteOutlined />} onClick={() => onChange?.("")} />}
      </Space.Compact>
    </div>
  );
}
