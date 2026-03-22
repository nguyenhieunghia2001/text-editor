import { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme as antdTheme, Switch, Grid, Drawer, Button } from 'antd';
import { BulbOutlined, BulbFilled, MenuOutlined } from '@ant-design/icons';
import { Sidebar } from './components/Sidebar';
import { DocumentEditor } from './components/DocumentEditor';
import { getDocuments, type Document } from './api/documents';
import { lightTheme, darkTheme } from './theme';

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const screens = useBreakpoint();
  // If md is false, it means screen is < 768px.
  // We classify mobile & tablet portrait (< 768px) as small screens taking a Drawer
  const isSmallScreen = screens.md === false; 

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
    if (isSmallScreen) {
      setDrawerOpen(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (isSmallScreen) {
      setDrawerOpen(false);
    }
  };

  const currentTheme = isDarkMode ? 'dark' : 'light';
  const customTheme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // The sidebar content shared between the Sider and Drawer
  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, color: 'var(--text-color)' }}>MD Editor</h2>
        <Switch
          checked={isDarkMode}
          onChange={setIsDarkMode}
          checkedChildren={<BulbFilled />}
          unCheckedChildren={<BulbOutlined />}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'hidden' }}>
        <Sidebar
          documents={documents}
          selectedId={selectedId}
          onSelect={handleSelect}
          onAdd={handleAdd}
          onDelete={fetchDocuments}
        />
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        ...customTheme,
      }}
    >
      <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {/* Desktop Sidebar: Only visible when NOT a small screen */}
        {!isSmallScreen && (
          <Sider
            width={280}
            theme={isDarkMode ? 'dark' : 'light'}
            style={{ borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}
          >
            {sidebarContent}
          </Sider>
        )}

        {/* Mobile/Tablet Drawer: Only active on small screens */}
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen && isSmallScreen}
          width={280}
          bodyStyle={{ padding: 0, backgroundColor: 'var(--bg-color)' }}
        >
          {sidebarContent}
        </Drawer>

        <Layout style={{ backgroundColor: 'var(--bg-color)' }}>
          {/* Header for Mobile/Tablet sizes with Hamburger menu */}
          {isSmallScreen && (
            <div style={{ 
              height: 56, 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0 16px', 
              backgroundColor: 'var(--bg-color)', 
              borderBottom: '1px solid var(--border-color)',
              flexShrink: 0
            }}>
              <Button 
                type="text" 
                icon={<MenuOutlined style={{ fontSize: '20px', color: 'var(--text-color)' }} />} 
                onClick={() => setDrawerOpen((prev) => !prev)} 
              />
              <span style={{ marginLeft: 16, fontSize: '18px', fontWeight: 'bold', color: 'var(--text-color)' }}>MD Editor</span>
            </div>
          )}

          <Content style={{ backgroundColor: 'var(--bg-color)', overflowY: 'hidden', height: isSmallScreen ? 'calc(100vh - 56px)' : '100vh' }}>
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
