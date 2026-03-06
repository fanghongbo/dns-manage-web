<div align="center">
  <h1>🌐 DNS 多云管理系统</h1>
  <p>基于 Vue 3 + Vite + TypeScript 构建的现代化 DNS 多云管理平台</p>
</div>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)

</div>

## 📖 项目简介

DNS 多云管理系统是一个现代化的 DNS 域名和多云平台统一管理平台，支持多域名、多云服务商的集中管理，提供完整的用户权限体系、操作审计等功能。系统基于 Vue 构建，采用最新的前端技术栈，提供流畅的用户体验。

## ✨ 核心功能

### 🌍 DNS 管理

- **域名管理**：支持域名的增删改查，域名状态管理
- **多云平台管理**：统一管理多个云服务商的 DNS 服务
- **批量操作**：支持批量域名操作，提高管理效率

### 👥 系统管理

- **用户管理**：用户账号的创建、编辑、禁用等操作
- **角色管理**：基于角色的权限控制（RBAC）
- **部门管理**：组织架构管理，支持树形结构
- **操作审计**：完整的操作日志记录和审计功能

### 📊 仪表板

- **数据统计**：DNS 解析量、域名数量等关键指标
- **趋势分析**：数据可视化展示
- **访问分析**：访问来源、访问量等数据分析

### 🔐 权限与安全

- **动态路由**：基于权限的动态路由生成
- **菜单权限**：细粒度的菜单访问控制
- **操作权限**：按钮级别的权限控制
- **Token 认证**：安全的身份认证机制

## 🛠️ 技术栈

### 前端框架

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 的状态管理库

### UI 组件库

- **Ant Design Vue** - 企业级 UI 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Iconify** - 丰富的图标库

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **Vitest** - 单元测试框架
- **Playwright** - E2E 测试框架

### 工程化

- **Monorepo** - 使用 pnpm workspace 管理多包项目
- **Turbo** - 高性能构建系统
- **Changesets** - 版本管理和变更日志

## 📁 项目结构

```
dns-manage-web/
├── apps/
│   └── dns-manage-web/          # 主应用
│       ├── src/
│       │   ├── api/             # API 接口定义
│       │   │   ├── core/        # 核心 API（认证、用户、菜单）
│       │   │   └── system/      # 系统管理 API
│       │   ├── views/           # 页面组件
│       │   │   ├── dns/         # DNS 管理页面
│       │   │   │   ├── domain/  # 域名管理
│       │   │   │   └── provider/  # 多云平台管理
│       │   │   ├── system/      # 系统管理页面
│       │   │   │   ├── user/    # 用户管理
│       │   │   │   ├── role/    # 角色管理
│       │   │   │   ├── dept/    # 部门管理
│       │   │   │   └── audit/   # 操作审计
│       │   │   └── dashboard/   # 仪表板
│       │   ├── router/          # 路由配置
│       │   ├── store/          # 状态管理
│       │   ├── layouts/        # 布局组件
│       │   └── locales/        # 国际化资源
│       └── package.json
├── packages/                    # 共享包
│   ├── @core/                  # 核心包
│   │   ├── base/              # 基础包（设计、图标、共享、类型）
│   │   ├── composables/        # 组合式函数
│   │   ├── preferences/        # 偏好设置
│   │   └── ui-kit/            # UI 组件库
│   └── effects/               # 功能包
│       ├── layouts/           # 布局组件
│       ├── common-ui/        # 通用 UI
│       ├── hooks/            # Hooks
│       └── ...
├── internal/                  # 内部工具包
│   ├── vite-config/         # Vite 配置
│   ├── tailwind-config/     # Tailwind 配置
│   └── ...
└── package.json              # 根 package.json
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20.12.0
- **pnpm** >= 10.0.0

### 安装依赖

```bash
# 安装 pnpm（如果未安装）
npm i -g pnpm

# 安装项目依赖
pnpm install
```

### 开发运行

```bash
# 启动开发服务器
pnpm dev

# 或者只启动主应用
pnpm dev:antd
```

开发服务器启动后，访问 `http://localhost:5173`

### 构建生产版本

```bash
# 构建所有包
pnpm build

# 构建主应用
pnpm build:antd
```

### 预览生产构建

```bash
pnpm preview
```

## 📝 开发指南

### 代码规范

项目使用 ESLint + Prettier 进行代码规范检查：

```bash
# 检查代码
pnpm lint

# 自动修复代码
pnpm format
```

### 类型检查

```bash
pnpm check:type
```

### 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

### 添加新功能模块

1. 在 `apps/dns-manage-web/src/views/` 下创建新的页面组件
2. 在 `apps/dns-manage-web/src/router/routes/modules/` 下添加路由配置
3. 在 `apps/dns-manage-web/src/api/` 下添加对应的 API 接口
4. 在 `apps/dns-manage-web/src/locales/` 下添加国际化文本

### 国际化

项目支持中英文双语，国际化文件位于：

- `apps/dns-manage-web/src/locales/langs/zh-CN/`
- `apps/dns-manage-web/src/locales/langs/en-US/`

## 🔧 配置说明

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# 应用标题
VITE_APP_TITLE=DNS 多云管理系统

# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# 应用命名空间
VITE_APP_NAMESPACE=dns-manage

# 应用版本
VITE_APP_VERSION=1.0.0
```

### 偏好设置

应用偏好设置位于 `apps/dns-manage-web/src/preferences.ts`，可以配置：

- 应用名称
- 布局模式
- 主题配置
- 其他 UI 偏好

## 🧪 测试

```bash
# 运行单元测试
pnpm test:unit

# 运行 E2E 测试
pnpm test:e2e
```

## 📦 部署

### Docker 部署

```bash
# 构建 Docker 镜像
pnpm build:docker
```

### 静态资源部署

构建完成后，将 `apps/dns-manage-web/dist` 目录部署到静态资源服务器（如 Nginx、CDN 等）。

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feat/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feat/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 👥 维护者

- 运维开发团队

## 🙏 致谢

- [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) - 基于此框架构建
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Ant Design Vue](https://antdv.com/) - 企业级 UI 组件库

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/your-repo/issues)
- 发送邮件至：your-email@example.com

---

<div align="center">
  <p>Made with ❤️ by 运维开发团队</p>
</div>
