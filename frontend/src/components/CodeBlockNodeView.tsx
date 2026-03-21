import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { useState } from 'react';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

export const CodeBlockNodeView = ({ node, updateAttributes, extension }: any) => {
  const [copied, setCopied] = useState(false);
  const { language: defaultLanguage } = extension.options;

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper style={{ margin: '16px 0', position: 'relative' }}>
      <div style={{
        borderRadius: 8, overflow: 'hidden',
        border: '1px solid #333', backgroundColor: '#1e1e1e'
      }}>
        <div contentEditable="false" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px 4px 16px', color: '#888', fontSize: 13,
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <select
            value={node.attrs.language || defaultLanguage || 'plaintext'}
            onChange={event => updateAttributes({ language: event.target.value })}
            style={{
              background: 'transparent', color: '#888', border: 'none',
              outline: 'none', textTransform: 'lowercase', cursor: 'pointer',
              fontSize: 13, fontFamily: 'inherit'
            }}
          >
            <option value="plaintext">plaintext</option>
            <option value="javascript">javascript</option>
            <option value="typescript">typescript</option>
            <option value="xml">html/xml</option>
            <option value="css">css</option>
            <option value="python">python</option>
            <option value="bash">bash</option>
            <option value="json">json</option>
            <option value="markdown">markdown</option>
          </select>
          <div
            onClick={handleCopy}
            title="Copy code"
            style={{
              cursor: 'pointer', transition: 'color 0.2s',
              color: copied ? '#52c41a' : '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4
            }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = '#ccc'; }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = '#888'; }}
          >
            {copied ? <CheckOutlined /> : <CopyOutlined />}
          </div>
        </div>
        <pre style={{ margin: 0, padding: 0 }}>
          <code className={`language-${node.attrs.language || defaultLanguage}`} style={{ 
            padding: '8px 16px 16px 16px', margin: 0, background: 'transparent', 
            fontSize: 14, display: 'block', lineHeight: 1.5, color: '#d4d4d4' 
          }}>
            <NodeViewContent />
          </code>
        </pre>
      </div>
    </NodeViewWrapper>
  );
};
