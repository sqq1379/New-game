# Firebase 配置指南

## 步骤 1: 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "添加项目" 或 "Add project"
3. 输入项目名称（例如：hextris-game）
4. 根据需要选择是否启用 Google Analytics
5. 等待项目创建完成

## 步骤 2: 注册 Web 应用

1. 在项目概览页面，点击 Web 图标 (</>)
2. 输入应用昵称（例如：Hextris Web App）
3. 不需要设置 Firebase Hosting（除非你想使用）
4. 点击 "注册应用"

## 步骤 3: 获取配置信息

Firebase 会显示类似以下的配置代码：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

复制这些配置信息，替换 `js/config.js` 中的相应内容。

## 步骤 4: 启用 Authentication

1. 在左侧菜单选择 "Authentication"
2. 点击 "开始使用" 或 "Get started"
3. 选择 "Sign-in method" 标签
4. 点击 "Email/Password"
5. 启用第一个选项（Email/Password）
6. 点击 "保存"

## 步骤 5: 创建 Firestore Database

1. 在左侧菜单选择 "Firestore Database"
2. 点击 "创建数据库"
3. 选择位置（建议选择离用户较近的区域）
4. 选择 "以测试模式启动"（之后会设置安全规则）
5. 点击 "启用"

## 步骤 6: 配置 Firestore 安全规则

1. 在 Firestore Database 页面，选择 "规则" 标签
2. 替换为以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户数据 - 只有登录用户可以读取，只能修改自己的数据
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 游戏会话 - 只有登录用户可以读取，只能创建自己的记录
    match /gameSessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. 点击 "发布"

## 步骤 7: 配置 OpenAI API（可选）

如果你想使用真实的 AI 分析功能：

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册账户（如果还没有）
3. 进入 [API Keys 页面](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key"
5. 复制生成的 API Key
6. 在 `js/config.js` 中替换 `YOUR_OPENAI_API_KEY`

**注意事项：**
- OpenAI API 是付费服务，请注意使用量
- 可以在 OpenAI Dashboard 设置使用限额
- 即使不配置此项，游戏的基于规则的分析功能仍然可用

## 费用说明

### Firebase 免费额度（Spark 计划）

- **Authentication**: 
  - 免费，无限制
  
- **Firestore**: 
  - 存储: 1 GB
  - 读取: 50,000 次/天
  - 写入: 20,000 次/天
  - 删除: 20,000 次/天

对于小型项目和测试，免费额度通常足够使用。

### OpenAI API 费用

- GPT-3.5-turbo: 约 $0.002 / 1K tokens
- 每次分析大约使用 300-500 tokens
- 可以设置每月使用限额

## 安全建议

1. **不要在公共代码库中提交真实的 API Keys**
2. **在生产环境使用环境变量**
3. **定期检查 Firebase 使用情况**
4. **为 Firebase 项目设置预算警报**
5. **为 OpenAI 账户设置使用限额**

## 故障排除

### Firebase 初始化失败
- 检查 `js/config.js` 中的配置是否正确
- 确保已启用 Authentication 和 Firestore
- 检查浏览器控制台的错误信息

### 无法登录/注册
- 确保已启用 Email/Password 认证方式
- 检查密码是否至少 6 位
- 查看浏览器控制台的错误详情

### 排行榜不显示
- 确保 Firestore 安全规则已正确设置
- 检查是否有游戏记录（需要先玩一局游戏）
- 查看浏览器控制台是否有权限错误

### AI 分析失败
- 如果配置了 OpenAI API，检查 API Key 是否正确
- 检查 OpenAI 账户是否有足够额度
- 即使失败，也会显示基于规则的分析

## 联系支持

如果遇到问题：
1. 查看浏览器控制台的错误信息
2. 在 GitHub 仓库提交 Issue
3. 查阅 [Firebase 文档](https://firebase.google.com/docs)
4. 查阅 [OpenAI 文档](https://platform.openai.com/docs)
