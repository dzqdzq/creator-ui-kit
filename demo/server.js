#!/usr/bin/env node

/**
 * 简单的 HTTP 服务器，用于运行 UI-Kit Demo
 * 使用方法: node demo/server.js
 * 或者: pnpm run demo
 */

import { createServer } from 'http';
import { readFileSync, statSync, existsSync } from 'fs';
import { join, resolve, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const PORT = 3000;
const ROOT = resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = createServer((req, res) => {
  let pathname = req.url.split('?')[0];
  
  // 默认访问 demo/index.html
  if (pathname === '/' || pathname === '/demo' || pathname === '/demo/') {
    pathname = '/demo/index.html';
  }
  
  // 处理路径
  let filePath;
  if (pathname.startsWith('/demo/')) {
    // 访问 demo 目录下的文件
    const relativePath = pathname.substring(6); // 去掉 '/demo/'
    filePath = join(ROOT, 'demo', relativePath);
  } else if (pathname.startsWith('/dist/') || pathname.startsWith('/node_modules/')) {
    // 访问 dist 或 node_modules 目录
    filePath = join(ROOT, pathname.substring(1));
  } else {
    // 其他路径，尝试在项目根目录查找
    filePath = join(ROOT, pathname.substring(1));
  }
  
  // 安全检查：确保文件在项目根目录内
  const normalizedPath = resolve(filePath);
  const normalizedRoot = resolve(ROOT);
  if (!normalizedPath.startsWith(normalizedRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    const content = readFileSync(filePath);
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': content.length,
    });
    res.end(content);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 UI-Kit Demo 服务器已启动！`);
  console.log(`\n📍 访问地址:`);
  console.log(`   http://localhost:${PORT}/demo/index.html`);
  console.log(`   http://localhost:${PORT}/demo/`);
  console.log(`\n💡 按 Ctrl+C 停止服务器\n`);
});

