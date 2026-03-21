import { useState, useEffect } from 'react';
import { Input, Button, Space, message, Popconfirm } from 'antd';
import { SaveOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { CodeBlockNodeView } from './CodeBlockNodeView';
import { createDocument, updateDocument, deleteDocument } from '../api/documents';
import type { Document } from '../api/documents';

const lowlight = createLowlight(common);

interface DocumentEditorProps {
  document: Document | null;
  onSaveSuccess: () => void;
  onDeleteSuccess: () => void;
  theme: 'light' | 'dark';
}

const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
      <Button 
        type={editor.isActive('bold') ? 'primary' : 'default'} 
        size="small" 
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </Button>
      <Button 
        type={editor.isActive('italic') ? 'primary' : 'default'} 
        size="small" 
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </Button>
      <Button 
        type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'} 
        size="small" 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>
      <Button 
        type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'} 
        size="small" 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>
      <Button 
        type={editor.isActive('codeBlock') ? 'primary' : 'default'} 
        size="small" 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        Code Block
      </Button>
      <input 
        type="color" 
        title="Text Color"
        onChange={event => editor.chain().focus().setColor(event.target.value).run()} 
        value={editor.getAttributes('textStyle').color || '#000000'}
        style={{ width: 24, height: 24, padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
      />
    </div>
  );
};

export const DocumentEditor = ({ document, onSaveSuccess, onDeleteSuccess, theme }: DocumentEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use custom code block
      }),
      TextStyle,
      Color,
      FontFamily,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNodeView);
        },
      }).configure({ lowlight }),
    ],
    content: content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setIsEditing(false); // Default to view mode if opening existing docs
      if (editor) {
        editor.commands.setContent(document.content);
        editor.setEditable(false);
      }
    } else {
      setTitle('');
      setContent('');
      setIsEditing(true);
      if (editor) {
        editor.commands.setContent('');
        editor.setEditable(true);
      }
    }
  }, [document, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      message.warning('Document cannot be totally empty.');
      return;
    }
    setLoading(true);
    try {
      if (document) {
        await updateDocument(document.id, { title, content });
        message.success('Document updated successfully');
      } else {
        await createDocument({ title: title || 'Untitled', content });
        message.success('Document created successfully');
      }
      setIsEditing(false);
      onSaveSuccess();
    } catch (error: any) {
      console.error('Failed to save document:', error);
      message.error(`Failed to save document: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    try {
      await deleteDocument(document.id);
      message.success('Document deleted');
      onDeleteSuccess();
    } catch (error) {
      message.error('Failed to delete document');
    }
  };

  return (
    <div className="tiptap-editor-container" data-color-mode={theme}>
      <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
        <Input
          size="large"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isEditing}
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            border: 'none',
            borderBottom: isEditing ? '1px solid var(--border-color)' : 'none',
            borderRadius: 0,
            padding: '4px 0',
            backgroundColor: 'transparent',
            color: 'var(--text-color)',
            boxShadow: 'none',
            width: '60%',
            fontFamily: 'inherit'
          }}
        />
        <Space>
          {isEditing ? (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
              Save
            </Button>
          ) : (
            <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
          {document && !isEditing && (
            <Popconfirm
              title="Delete the document"
              description="Are you sure to delete this document?"
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      {isEditing && <EditorToolbar editor={editor} />}

      <div className="tiptap-editor-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <EditorContent editor={editor} style={{ flex: 1, height: '100%', minHeight: '100%' }} />
      </div>
    </div>
  );
};
