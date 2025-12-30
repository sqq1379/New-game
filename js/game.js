// Hextris Game Logic
class HextrisGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 600;
        
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.hexRadius = 100;
        this.blockSize = 20;
        
        this.score = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameData = {
            moves: [],
            blocks: [],
            startTime: null,
            endTime: null
        };
        
        this.rotation = 0;
        this.rotationSpeed = 2;
        this.currentBlock = null;
        this.blockSpeed = 2;
        this.blockDistance = 300;
        
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        this.hexagonBlocks = this.initHexagonBlocks();
        
        this.setupControls();
    }
    
    initHexagonBlocks() {
        // 六边形的6个边，每个边可以放置方块
        const blocks = [];
        for (let i = 0; i < 6; i++) {
            blocks.push([]);
        }
        return blocks;
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isPaused) return;
            
            if (e.key === 'ArrowLeft') {
                this.rotateLeft();
            } else if (e.key === 'ArrowRight') {
                this.rotateRight();
            }
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    start() {
        if (this.isPlaying) return;
        
        this.score = 0;
        this.rotation = 0;
        this.hexagonBlocks = this.initHexagonBlocks();
        this.isPlaying = true;
        this.isPaused = false;
        
        this.gameData = {
            moves: [],
            blocks: [],
            startTime: Date.now(),
            endTime: null
        };
        
        document.getElementById('current-score').textContent = '0';
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-btn').disabled = true;
        
        this.spawnBlock();
        this.gameLoop();
    }
    
    restart() {
        this.start();
    }
    
    rotateLeft() {
        this.rotation = (this.rotation - 1 + 6) % 6;
        this.gameData.moves.push({ time: Date.now(), direction: 'left', rotation: this.rotation });
    }
    
    rotateRight() {
        this.rotation = (this.rotation + 1) % 6;
        this.gameData.moves.push({ time: Date.now(), direction: 'right', rotation: this.rotation });
    }
    
    spawnBlock() {
        const side = Math.floor(Math.random() * 6);
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        this.currentBlock = {
            side: side,
            color: color,
            distance: this.blockDistance
        };
        
        this.gameData.blocks.push({
            time: Date.now(),
            side: side,
            color: color
        });
    }
    
    updateBlock() {
        if (!this.currentBlock) return;
        
        this.currentBlock.distance -= this.blockSpeed;
        
        if (this.currentBlock.distance <= this.hexRadius) {
            // 方块到达六边形
            this.placeBlock();
        }
    }
    
    placeBlock() {
        const targetSide = (this.currentBlock.side - this.rotation + 6) % 6;
        this.hexagonBlocks[targetSide].push(this.currentBlock.color);
        
        this.checkLines();
        this.currentBlock = null;
        
        // 检查游戏结束
        if (this.checkGameOver()) {
            this.gameOver();
        } else {
            setTimeout(() => this.spawnBlock(), 500);
        }
    }
    
    checkLines() {
        let linesCleared = 0;
        
        for (let i = 0; i < 6; i++) {
            const side = this.hexagonBlocks[i];
            if (side.length >= 3) {
                // 检查是否有连续的相同颜色
                for (let j = 0; j <= side.length - 3; j++) {
                    if (side[j] === side[j + 1] && side[j] === side[j + 2]) {
                        // 找到三个相同颜色
                        side.splice(j, 3);
                        linesCleared++;
                        this.score += 100;
                        j--; // 重新检查这个位置
                    }
                }
            }
        }
        
        if (linesCleared > 0) {
            document.getElementById('current-score').textContent = this.score;
        }
    }
    
    checkGameOver() {
        // 检查任何一边是否已满
        for (let i = 0; i < 6; i++) {
            if (this.hexagonBlocks[i].length > 10) {
                return true;
            }
        }
        return false;
    }
    
    async gameOver() {
        this.isPlaying = false;
        this.gameData.endTime = Date.now();
        document.getElementById('start-btn').disabled = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
        
        // 保存游戏记录
        await this.saveGameSession();
        
        // 更新高分
        const user = authManager.getCurrentUser();
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const currentHighScore = userDoc.data().highScore || 0;
            
            if (this.score > currentHighScore) {
                await db.collection('users').doc(user.uid).update({
                    highScore: this.score
                });
                document.getElementById('high-score').textContent = this.score;
            }
            
            // 更新排行榜
            if (window.leaderboardManager) {
                window.leaderboardManager.loadLeaderboard();
            }
        }
    }
    
    async saveGameSession() {
        const user = authManager.getCurrentUser();
        if (!user) return;
        
        try {
            const sessionData = {
                userId: user.uid,
                email: user.email,
                score: this.score,
                moves: this.gameData.moves.length,
                blocks: this.gameData.blocks.length,
                duration: (this.gameData.endTime - this.gameData.startTime) / 1000,
                gameData: this.gameData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            };
            
            const docRef = await db.collection('gameSessions').add(sessionData);
            this.lastSessionId = docRef.id;
            
            // 更新用户统计
            await db.collection('users').doc(user.uid).update({
                totalGames: firebase.firestore.FieldValue.increment(1)
            });
            
            console.log('Game session saved:', docRef.id);
        } catch (error) {
            console.error('Error saving game session:', error);
        }
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawHexagon();
        this.drawBlocks();
        this.updateBlock();
        
        if (this.currentBlock) {
            this.drawCurrentBlock();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    drawHexagon() {
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = this.centerX + this.hexRadius * Math.cos(angle);
            const y = this.centerY + this.hexRadius * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawBlocks() {
        for (let side = 0; side < 6; side++) {
            const blocks = this.hexagonBlocks[side];
            
            for (let i = 0; i < blocks.length; i++) {
                const angle = (Math.PI / 3) * side;
                const distance = this.hexRadius - (i * this.blockSize);
                
                const x = this.centerX + distance * Math.cos(angle);
                const y = this.centerY + distance * Math.sin(angle);
                
                this.ctx.fillStyle = blocks[i];
                this.ctx.fillRect(x - this.blockSize / 2, y - this.blockSize / 2, 
                                 this.blockSize, this.blockSize);
            }
        }
    }
    
    drawCurrentBlock() {
        const side = (this.currentBlock.side - this.rotation + 6) % 6;
        const angle = (Math.PI / 3) * side;
        
        const x = this.centerX + this.currentBlock.distance * Math.cos(angle);
        const y = this.centerY + this.currentBlock.distance * Math.sin(angle);
        
        this.ctx.fillStyle = this.currentBlock.color;
        this.ctx.fillRect(x - this.blockSize / 2, y - this.blockSize / 2, 
                         this.blockSize, this.blockSize);
    }
    
    getLastSessionId() {
        return this.lastSessionId;
    }
}

// 初始化游戏
const game = new HextrisGame('game-canvas');
