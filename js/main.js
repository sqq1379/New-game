// Main Application Entry Point
console.log('Hextris Game initialized');

// 全局错误处理
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// 检查 Firebase 配置
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded');
    alert('游戏初始化失败：Firebase SDK 未加载');
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // 检查是否正确配置了 Firebase
    if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6b6b;
            color: white;
            padding: 15px 30px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
        `;
        notice.innerHTML = `
            <p><strong>⚠️ 配置提醒</strong></p>
            <p>请先在 js/config.js 中配置 Firebase 设置</p>
            <p style="font-size: 12px; margin-top: 10px;">
                访问 <a href="https://console.firebase.google.com/" target="_blank" style="color: white; text-decoration: underline;">Firebase Console</a> 创建项目
            </p>
        `;
        document.body.appendChild(notice);
    }
});
