import { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme as antdTheme, Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { Sidebar } from './components/Sidebar';
import { DocumentEditor } from './components/DocumentEditor';
import { getDocuments, type Document } from './api/documents';
import { lightTheme, darkTheme } from './theme';

const { Sider, Content } = Layout;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAdd = () => {
    setSelectedId(null);
  };

  const currentTheme = isDarkMode ? 'dark' : 'light';
  const customTheme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        ...customTheme,
      }}
    >
      <Layout style={{ minHeight: '100vh', width: '100vw' }}>
        <Sider
          width={280}
          theme={isDarkMode ? 'dark' : 'light'}
          style={{ borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}
        >
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: 'var(--text-color)' }}>MD Editor</h2>
            <Switch
              checked={isDarkMode}
              onChange={setIsDarkMode}
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
            />
          </div>
          <div style={{ height: 'calc(100vh - 64px)' }}>
            <Sidebar
              documents={documents}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdd={handleAdd}
              onDelete={fetchDocuments}
            />
          </div>
        </Sider>
        <Layout>
          <Content style={{ backgroundColor: 'var(--bg-color)', overflowY: 'hidden' }}>
            <DocumentEditor
              theme={currentTheme}
              document={selectedId ? documents.find(d => d.id === selectedId) || null : null}
              onSaveSuccess={() => {
                fetchDocuments();
              }}
              onDeleteSuccess={() => {
                setSelectedId(null);
                fetchDocuments();
              }}
            />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
