# Firestore 数据结构示例

本文档展示了应用程序使用的 Firestore 数据结构。

## 集合（Collections）

### 1. users

存储用户信息和统计数据。

**文档 ID**: Firebase Auth UID

**字段结构**:
```json
{
  "email": "user@example.com",
  "createdAt": Timestamp(2024-01-01 12:00:00),
  "highScore": 1500,
  "totalGames": 25
}
```

**字段说明**:
- `email` (string): 用户的邮箱地址
- `createdAt` (timestamp): 账户创建时间
- `highScore` (number): 用户的历史最高分
- `totalGames` (number): 用户玩过的游戏总数

**示例查询**:
```javascript
// 获取用户信息
const userDoc = await db.collection('users').doc(userId).get();
const userData = userDoc.data();

// 更新高分
await db.collection('users').doc(userId).update({
  highScore: newScore
});
```

---

### 2. gameSessions

存储每一局游戏的详细记录。

**文档 ID**: 自动生成

**字段结构**:
```json
{
  "userId": "abc123def456",
  "email": "user@example.com",
  "score": 1200,
  "moves": 150,
  "blocks": 80,
  "duration": 245.5,
  "gameData": {
    "moves": [
      {
        "time": 1704110400000,
        "direction": "left",
        "rotation": 2
      },
      {
        "time": 1704110401000,
        "direction": "right",
        "rotation": 3
      }
    ],
    "blocks": [
      {
        "time": 1704110400000,
        "side": 2,
        "color": "#FF6B6B"
      },
      {
        "time": 1704110402000,
        "side": 4,
        "color": "#4ECDC4"
      }
    ],
    "startTime": 1704110400000,
    "endTime": 1704110645500
  },
  "timestamp": Timestamp(2024-01-01 12:00:00),
  "date": "2024-01-01"
}
```

**字段说明**:
- `userId` (string): 玩家的用户 ID（Firebase Auth UID）
- `email` (string): 玩家的邮箱地址
- `score` (number): 本局游戏得分
- `moves` (number): 操作次数（旋转次数）
- `blocks` (number): 出现的方块总数
- `duration` (number): 游戏时长（秒）
- `gameData` (object): 详细的游戏数据
  - `moves` (array): 每次操作的记录
    - `time` (number): 操作时间戳
    - `direction` (string): 旋转方向（"left" 或 "right"）
    - `rotation` (number): 旋转后的状态（0-5）
  - `blocks` (array): 每个方块的记录
    - `time` (number): 方块出现时间戳
    - `side` (number): 方块所在的边（0-5）
    - `color` (string): 方块颜色
  - `startTime` (number): 游戏开始时间戳
  - `endTime` (number): 游戏结束时间戳
- `timestamp` (timestamp): 记录创建时间（服务器时间）
- `date` (string): 游戏日期（YYYY-MM-DD 格式，用于每日排行榜）

**示例查询**:
```javascript
// 保存游戏记录
const sessionData = {
  userId: user.uid,
  email: user.email,
  score: 1200,
  moves: 150,
  blocks: 80,
  duration: 245.5,
  gameData: gameData,
  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  date: new Date().toISOString().split('T')[0]
};
await db.collection('gameSessions').add(sessionData);

// 查询今日排行榜
const today = new Date().toISOString().split('T')[0];
const snapshot = await db.collection('gameSessions')
  .where('date', '==', today)
  .orderBy('score', 'desc')
  .limit(10)
  .get();

// 查询用户的游戏历史
const userSessions = await db.collection('gameSessions')
  .where('userId', '==', userId)
  .orderBy('timestamp', 'desc')
  .limit(20)
  .get();

// 获取特定游戏记录用于 AI 分析
const sessionDoc = await db.collection('gameSessions').doc(sessionId).get();
const sessionData = sessionDoc.data();
```

---

## 索引（Indexes）

为了确保查询性能，需要创建以下复合索引：

### 必需的索引

1. **gameSessions 集合 - 今日排行榜查询**
   - 字段:
     - `date` (Ascending)
     - `score` (Descending)
   - 查询范围: Collection

2. **gameSessions 集合 - 用户历史查询**
   - 字段:
     - `userId` (Ascending)
     - `timestamp` (Descending)
   - 查询范围: Collection

### 在 Firebase Console 中创建索引

1. 进入 Firestore Database
2. 选择 "Indexes" 标签
3. 点击 "Create Index"
4. 按照上述规格创建索引

或者，当你首次运行查询时，Firebase 会在控制台显示错误信息，并提供直接创建索引的链接。

---

## 安全规则

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 用户集合
    match /users/{userId} {
      // 任何已登录用户都可以读取其他用户的基本信息
      allow read: if request.auth != null;
      
      // 用户只能创建和修改自己的文档
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // 不允许删除用户文档
      allow delete: if false;
    }
    
    // 游戏会话集合
    match /gameSessions/{sessionId} {
      // 任何已登录用户都可以读取游戏记录（用于排行榜）
      allow read: if request.auth != null;
      
      // 用户只能创建自己的游戏记录
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.email == request.auth.token.email;
      
      // 用户可以修改自己的游戏记录（通常不需要）
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // 用户可以删除自己的游戏记录
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 数据使用统计

### 估算的数据使用量

假设一个用户玩 10 局游戏，每局游戏：
- 平均操作 100 次
- 平均方块 80 个
- 游戏时长 3 分钟

**每局游戏的数据大小**:
- 基本字段: ~200 bytes
- gameData.moves (100 个): ~5 KB
- gameData.blocks (80 个): ~4 KB
- **总计**: ~9 KB / 局

**10 局游戏**: ~90 KB
**100 个用户，每人 10 局**: ~9 MB

Firebase 免费版提供 1 GB 存储空间，足够支持大量用户。

### 估算的读写操作

**每个用户会话**:
- 读取: 
  - 登录时读取用户信息: 1 次
  - 加载排行榜: 1 次（返回最多 10 条记录）
  - 每 30 秒刷新排行榜: ~2 次/分钟
- 写入:
  - 注册新用户: 1 次
  - 每局游戏结束: 2 次（游戏记录 + 更新用户统计）

**每天 100 个活跃用户**:
- 每人平均玩 5 局
- 每人在线 15 分钟

- 读取: ~5,000 次/天
- 写入: ~1,000 次/天

Firebase 免费版提供：
- 读取: 50,000 次/天
- 写入: 20,000 次/天

使用量远低于免费额度。

---

## 数据清理建议

为了控制数据增长，建议定期清理旧的游戏记录：

```javascript
// 删除 30 天前的游戏记录（需要在服务器端运行）
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const oldSessions = await db.collection('gameSessions')
  .where('timestamp', '<', thirtyDaysAgo)
  .get();

const batch = db.batch();
oldSessions.forEach(doc => {
  batch.delete(doc.ref);
});
await batch.commit();
```

可以使用 Firebase Cloud Functions 定期自动执行此操作。

---

## 扩展建议

### 未来可以添加的集合

1. **achievements** - 成就系统
2. **friends** - 好友关系
3. **challenges** - 挑战赛
4. **weeklyLeaderboard** - 周排行榜
5. **monthlyLeaderboard** - 月排行榜
6. **gameReplays** - 游戏回放数据

每个新功能都应该仔细设计数据结构和查询模式，以优化性能和成本。
