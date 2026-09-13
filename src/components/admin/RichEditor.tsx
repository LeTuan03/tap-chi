"use client";

import {
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  MinusOutlined,
  OrderedListOutlined,
  PictureOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { App, Button, Tooltip, Upload } from "antd";
import { useEffect, useRef } from "react";

interface Props {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

/** Trình soạn thảo nội dung bài viết (TipTap), tương thích Form.Item của antd qua value/onChange */
export default function RichEditor({ value = "", onChange, placeholder = "Nhập nội dung bài viết..." }: Props) {
  const { message } = App.useApp();
  const lastEmitted = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "nofollow noopener", target: "_blank" } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap", "data-placeholder": placeholder } },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmitted.current = html;
      onChange?.(html);
    },
  });

  // Đồng bộ khi form nạp dữ liệu từ server (setFieldsValue)
  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return <div className="rich-editor" style={{ minHeight: 460 }} />;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Nhập địa chỉ liên kết (để trống để bỏ liên kết):", prev ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  const insertImageUrl = () => {
    const src = window.prompt("Nhập URL ảnh:");
    if (!src) return;
    const alt = window.prompt("Mô tả ảnh (alt) – tốt cho SEO:") ?? "";
    editor.chain().focus().setImage({ src, alt }).run();
  };

  const btn = (label: string, icon: React.ReactNode, active: boolean, onClick: () => void, text?: string) => (
    <Tooltip title={label} key={label}>
      <Button size="small" className={active ? "is-active" : ""} icon={icon} onClick={onClick} onMouseDown={(e) => e.preventDefault()}>
        {text}
      </Button>
    </Tooltip>
  );

  return (
    <div className="rich-editor">
      <div className="rich-editor__toolbar">
        {btn("Đậm (Ctrl+B)", <BoldOutlined />, editor.isActive("bold"), () => editor.chain().focus().toggleBold().run())}
        {btn("Nghiêng (Ctrl+I)", <ItalicOutlined />, editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run())}
        {btn("Gạch chân", <UnderlineOutlined />, editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run())}
        {btn("Gạch ngang", <StrikethroughOutlined />, editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run())}
        {btn("Tiêu đề 2", null, editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2")}
        {btn("Tiêu đề 3", null, editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3")}
        {btn("Đoạn văn", null, editor.isActive("paragraph"), () => editor.chain().focus().setParagraph().run(), "P")}
        {btn("Danh sách", <UnorderedListOutlined />, editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
        {btn("Danh sách số", <OrderedListOutlined />, editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run())}
        {btn("Trích dẫn", null, editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "❝")}
        {btn("Đường kẻ", <MinusOutlined />, false, () => editor.chain().focus().setHorizontalRule().run())}
        {btn("Liên kết", <LinkOutlined />, editor.isActive("link"), setLink)}
        {btn("Chèn ảnh từ URL", <PictureOutlined />, false, insertImageUrl)}
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
              const alt = window.prompt("Mô tả ảnh (alt) – tốt cho SEO:") ?? "";
              editor.chain().focus().setImage({ src: data.url, alt }).run();
              onSuccess?.(data);
            } catch (e) {
              message.error((e as Error).message);
              onError?.(e as Error);
            }
          }}
        >
          <Tooltip title="Tải ảnh lên">
            <Button size="small" icon={<PictureOutlined />} onMouseDown={(e) => e.preventDefault()}>
              Tải ảnh
            </Button>
          </Tooltip>
        </Upload>
        {btn("Hoàn tác", <UndoOutlined />, false, () => editor.chain().focus().undo().run())}
        {btn("Làm lại", <RedoOutlined />, false, () => editor.chain().focus().redo().run())}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
