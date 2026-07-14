# Heartwish Box - 心语盲盒

用随机情绪任务探索内心世界的 AI 情绪日记应用。

## 项目简介

心语盲盒是一款帮助用户通过随机任务来探索和记录内心情绪的日记应用。用户可以从盲盒中抽取情绪任务，完成任务后获得 AI 生成的情绪洞察、诗意表达和温暖话语，并选择一位情绪陪伴者进行对话交流。

## 功能特性

- 盲盒抽取：随机获取拍照记录、文字书写、行动打卡等情绪任务
- 情绪洞察：基于用户回应生成情绪分析、诗意表达和温暖话语
- 陪伴者系统：多位情绪陪伴者提供个性化对话和情感支持
- 历史记录：查看和管理所有情绪日记记录
- 内心状态分析：通过历史记录生成情绪趋势分析

## 技术栈

### 前端
- React 18
- TypeScript
- Vite 5
- CSS3（原生样式，无额外样式框架）

### 后端
- Node.js
- Express 4
- TypeScript
- JSON 文件存储（MVP 阶段）

## 项目结构

```
.
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # UI 组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── data/          # 静态数据
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # 类型定义
│   │   └── styles/        # 全局样式
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/               # 后端服务（不上传 GitHub）
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由
│   │   ├── config/        # 配置文件
│   │   └── index.ts       # 入口文件
│   └── package.json
├── .github/
│   └── workflows/         # GitHub Actions 配置
├── .gitignore
└── README.md
```

## 快速开始

### 前置条件

- Node.js 20+
- pnpm 8+

### 前端开发

```bash
cd frontend
pnpm install
pnpm run dev
```

访问 http://localhost:5173

### 后端开发

```bash
cd backend
pnpm install
pnpm run dev
```

后端服务运行在 http://localhost:3000

### 生产构建

```bash
# 前端构建
cd frontend
pnpm run build

# 后端构建
cd backend
pnpm run build
```

## 部署说明

### GitHub Pages 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages。每次推送到 main 分支会自动触发构建和部署。

部署地址：https://xiaomutou-git.github.io/HeartwishBox/

### 后端部署

后端服务需部署到支持 Node.js 的云平台（如 Vercel、Render、阿里云等），部署前需配置环境变量。

## API 接口

### 健康检查

GET /api/health

### 记录管理

- GET /api/records - 获取所有记录
- POST /api/records - 创建新记录
- GET /api/records/:id - 获取单条记录
- PUT /api/records/:id - 更新记录
- DELETE /api/records/:id - 删除记录

## 数据存储

MVP 阶段使用 JSON 文件存储，数据文件位于 `backend/data/records.json`。生产环境可迁移到 MySQL 数据库。

## 开发规范

- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码检查
- 前端异步操作使用 try-catch 包裹
- 后端错误处理使用 try-catch 包裹
- 代码注释遵循 JSDoc 规范

## 许可证

MIT License