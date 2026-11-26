import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { Playground } from './Playground';
import '../../src/antd/styles.css';
import './style.css';
const root = document.getElementById('root');
if (!root) throw new Error('Missing root element.');
createRoot(root).render(
  <React.StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: '#315efb', borderRadius: 8 } }}>
      <Playground />
    </ConfigProvider>
  </React.StrictMode>,
);
