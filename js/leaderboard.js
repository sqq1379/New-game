// Leaderboard Management
class LeaderboardManager {
    constructor() {
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.loadLeaderboard();
        
        // 每30秒刷新一次排行榜
        setInterval(() => this.loadLeaderboard(), 30000);
    }
    
    async loadLeaderboard() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // 查询今日所有游戏记录，按分数降序排列
            const snapshot = await db.collection('gameSessions')
                .where('date', '==', today)
                .orderBy('score', 'desc')
                .limit(10)
                .get();
            
            if (snapshot.empty) {
                this.leaderboardList.innerHTML = '<p class="loading">今日暂无记录</p>';
                return;
            }
            
            // 按用户分组，只保留每个用户的最高分
            const userBestScores = new Map();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;
                
                if (!userBestScores.has(userId) || 
                    userBestScores.get(userId).score < data.score) {
                    userBestScores.set(userId, {
                        email: data.email,
                        score: data.score,
                        timestamp: data.timestamp
                    });
                }
            });
            
            // 转换为数组并排序
            const leaderboard = Array.from(userBestScores.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            
            this.displayLeaderboard(leaderboard);
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.leaderboardList.innerHTML = '<p class="loading">加载失败</p>';
        }
    }
    
    displayLeaderboard(leaderboard) {
        if (leaderboard.length === 0) {
            this.leaderboardList.innerHTML = '<p class="loading">今日暂无记录</p>';
            return;
        }
        
        const currentUser = authManager.getCurrentUser();
        let html = '';
        
        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `top-${rank}` : '';
            const isCurrentUser = currentUser && entry.email === currentUser.email;
            const userClass = isCurrentUser ? 'current-user' : '';
            
            // 截取邮箱前缀，保护隐私
            const emailDisplay = this.maskEmail(entry.email);
            
            html += `
                <div class="leaderboard-item ${rankClass} ${userClass}">
                    <span class="leaderboard-rank">#${rank}</span>
                    <span class="leaderboard-email">${emailDisplay}</span>
                    <span class="leaderboard-score">${entry.score}</span>
                </div>
            `;
        });
        
        this.leaderboardList.innerHTML = html;
    }
    
    maskEmail(email) {
        // 隐藏邮箱的部分内容以保护隐私
        const [local, domain] = email.split('@');
        if (local.length <= 3) {
            return `${local[0]}**@${domain}`;
        }
        return `${local.substring(0, 3)}***@${domain}`;
    }
}

// 初始化排行榜管理器
window.leaderboardManager = new LeaderboardManager();
