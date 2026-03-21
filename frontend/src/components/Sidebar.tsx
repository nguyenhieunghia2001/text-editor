import { Button, List, Typography } from 'antd';
import { FileTextOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Document } from '../api/documents';

interface SidebarProps {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const { Text } = Typography;

export const Sidebar = ({ documents, selectedId, onSelect, onAdd, onDelete }: SidebarProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ width: '100%', backgroundColor: 'var(--primary-color)', color: 'var(--bg-color)' }}
          onClick={onAdd}
        >
          New Document
        </Button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <List
          dataSource={documents}
          renderItem={(item) => (
            <List.Item
              onClick={() => onSelect(item.id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: item.id === selectedId ? 'var(--hover-bg)' : 'transparent',
                borderBottom: '1px solid var(--border-color)',
              }}
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<FileTextOutlined style={{ fontSize: 24, color: 'var(--text-color)' }} />}
                title={<Text ellipsis style={{ color: 'var(--text-color)', width: 140 }}>{item.title || 'Untitled'}</Text>}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.updatedAt).toLocaleDateString()}</Text>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};
