# Hextris - 六边形方块游戏

基于 Hextris 的创新版本，集成了完整的后端系统，支持用户认证、数据存储、排行榜和 AI 游戏分析。

## 🎮 功能特性

### 核心游戏
- **六边形方块游戏**：经典的 Hextris 游戏玩法
- **实时得分系统**：即时显示当前分数和最高分
- **流畅的游戏体验**：使用 HTML5 Canvas 实现的高性能渲染

### 用户系统
- **邮箱注册/登录**：通过 Firebase Authentication 实现安全的用户认证
- **数据持久化**：游戏记录和用户数据存储在 Firestore
- **会话管理**：自动保存和恢复用户状态

### 排行榜系统
- **每日更新排行榜**：显示今日最高分前 10 名玩家
- **实时更新**：每 30 秒自动刷新排行榜数据
- **隐私保护**：邮箱地址部分隐藏

### AI 游戏分析
- **智能分析**：对游戏表现进行详细分析
- **数据洞察**：提供操作频率、消除效率等关键指标
- **个性化建议**：根据玩家表现给出改进建议
- **支持 OpenAI API**：可选配置真实的 AI 分析（需要 API Key）

## 📋 技术栈

- **前端**：HTML5, CSS3, JavaScript (原生)
- **后端服务**：Firebase (Authentication + Firestore)
- **AI 服务**：OpenAI API (可选)
- **游戏引擎**：Canvas 2D API

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/sqq1379/New-game.git
cd New-game
```

### 2. 配置 Firebase

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 在项目设置中获取 Web 应用配置
4. 打开 `js/config.js`，替换以下配置：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. 启用 Firebase 服务

在 Firebase Console 中：

1. **Authentication**：
   - 进入 "Authentication" → "Sign-in method"
   - 启用 "Email/Password" 登录方式

2. **Firestore Database**：
   - 创建 Firestore 数据库
   - 设置安全规则（见下方）

### 4. 配置 Firestore 安全规则

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户数据
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 游戏会话
    match /gameSessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. 配置 AI 分析（可选）

如果需要使用真实的 AI 分析功能：

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 获取 API Key
3. 在 `js/config.js` 中配置：

```javascript
const openaiConfig = {
    apiKey: "YOUR_OPENAI_API_KEY",
    model: "gpt-3.5-turbo"
};
```

**注意**：即使不配置 OpenAI API，游戏仍会提供基于规则的分析功能。

### 6. 运行游戏

使用任何 HTTP 服务器运行项目，例如：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx http-server

# 或使用 VS Code Live Server 扩展
```

然后在浏览器中访问 `http://localhost:8000`

## 🎯 游戏玩法

1. **注册/登录**：使用邮箱和密码创建账户或登录
2. **开始游戏**：点击"开始游戏"按钮
3. **控制方法**：
   - 使用 `←` 键向左旋转六边形
   - 使用 `→` 键向右旋转六边形
4. **消除规则**：让相同颜色的方块在同一边连成三个或更多即可消除
5. **游戏结束**：任何一边的方块堆积超过限制时游戏结束
6. **查看分析**：游戏结束后点击"AI分析"查看游戏表现分析

## 📊 数据结构

### Users Collection
```javascript
{
  email: string,
  createdAt: timestamp,
  highScore: number,
  totalGames: number
}
```

### GameSessions Collection
```javascript
{
  userId: string,
  email: string,
  score: number,
  moves: number,
  blocks: number,
  duration: number,
  gameData: {
    moves: array,
    blocks: array,
    startTime: timestamp,
    endTime: timestamp
  },
  timestamp: timestamp,
  date: string (YYYY-MM-DD)
}
```

## 🔒 安全说明

- **API Keys**：请妥善保管 Firebase 和 OpenAI 的 API Keys
- **生产环境**：建议使用环境变量或 Firebase Remote Config 管理配置
- **Firestore 规则**：确保正确配置安全规则，保护用户数据
- **费用控制**：设置 Firebase 和 OpenAI 的使用配额，避免意外费用

## 📝 开发说明

### 项目结构

```
New-game/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   ├── config.js      # Firebase 和 OpenAI 配置
│   ├── auth.js        # 用户认证逻辑
│   ├── game.js        # 游戏核心逻辑
│   ├── leaderboard.js # 排行榜管理
│   ├── ai-analysis.js # AI 分析功能
│   └── main.js        # 应用入口
└── README.md          # 项目文档
```

### 扩展功能建议

- 添加更多游戏模式（计时模式、挑战模式等）
- 实现好友系统和社交功能
- 添加每周/月度排行榜
- 实现游戏回放功能
- 添加成就系统
- 支持多语言
- 移动端适配优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- 原始 Hextris 游戏的创作者
- Firebase 提供的优秀后端服务
- OpenAI 的 AI 技术支持
