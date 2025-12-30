// Firebase Configuration
// 注意: 在生产环境中，请使用环境变量来保护这些密钥
// 用户需要在 Firebase Console 创建项目并替换以下配置

const firebaseConfig = {
    // 请访问 https://console.firebase.google.com/
    // 创建新项目，然后在项目设置中获取配置信息
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// OpenAI API Configuration for AI Analysis
// 用户需要在 https://platform.openai.com/ 获取 API Key
const openaiConfig = {
    apiKey: "YOUR_OPENAI_API_KEY",
    model: "gpt-3.5-turbo"
};

// 初始化 Firebase
let app, auth, db;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    // 如果 Firebase 配置无效，显示错误消息
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        console.warn("请在 js/config.js 中配置 Firebase 设置");
    }
}
