// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.setupAuthListeners();
    }

    setupAuthListeners() {
        // 监听认证状态变化
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.onLogin(user);
            } else {
                this.currentUser = null;
                this.onLogout();
            }
        });

        // 登录按钮
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        
        // 注册按钮
        document.getElementById('register-btn').addEventListener('click', () => this.register());
        
        // 登出按钮
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // 切换表单
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // 回车键登录
        document.getElementById('login-email').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
    }

    showLoginForm() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }

    showRegisterForm() {
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
    }

    async login() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('请输入邮箱和密码');
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // onAuthStateChanged 会自动处理登录后的操作
        } catch (error) {
            console.error('Login error:', error);
            this.handleAuthError(error);
        }
    }

    async register() {
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;

        if (!email || !password || !confirmPassword) {
            alert('请填写所有字段');
            return;
        }

        if (password.length < 6) {
            alert('密码至少需要6位');
            return;
        }

        if (password !== confirmPassword) {
            alert('两次输入的密码不匹配');
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // 创建用户文档
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                highScore: 0,
                totalGames: 0
            });

            // onAuthStateChanged 会自动处理登录后的操作
        } catch (error) {
            console.error('Registration error:', error);
            this.handleAuthError(error);
        }
    }

    async logout() {
        try {
            await auth.signOut();
            // onAuthStateChanged 会自动处理登出后的操作
        } catch (error) {
            console.error('Logout error:', error);
            alert('登出失败: ' + error.message);
        }
    }

    onLogin(user) {
        console.log('User logged in:', user.email);
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('user-email').textContent = user.email;
        
        // 加载用户数据
        this.loadUserData(user.uid);
        
        // 加载排行榜
        if (window.leaderboardManager) {
            window.leaderboardManager.loadLeaderboard();
        }
    }

    onLogout() {
        console.log('User logged out');
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('game-container').classList.add('hidden');
        
        // 清空表单
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm').value = '';
        
        this.showLoginForm();
    }

    async loadUserData(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                document.getElementById('high-score').textContent = userData.highScore || 0;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    handleAuthError(error) {
        let message = '操作失败';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = '该邮箱已被注册';
                break;
            case 'auth/invalid-email':
                message = '邮箱格式不正确';
                break;
            case 'auth/operation-not-allowed':
                message = '该操作未启用';
                break;
            case 'auth/weak-password':
                message = '密码强度太弱';
                break;
            case 'auth/user-disabled':
                message = '该账户已被禁用';
                break;
            case 'auth/user-not-found':
                message = '用户不存在';
                break;
            case 'auth/wrong-password':
                message = '密码错误';
                break;
            case 'auth/network-request-failed':
                message = '网络连接失败';
                break;
            default:
                message = error.message;
        }
        
        alert(message);
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// 初始化认证管理器
const authManager = new AuthManager();
