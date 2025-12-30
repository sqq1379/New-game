// AI Analysis for Game Sessions
class AIAnalysisManager {
    constructor() {
        this.analysisPanel = document.getElementById('ai-analysis');
        this.analysisContent = document.getElementById('analysis-content');
        
        document.getElementById('analyze-btn').addEventListener('click', () => {
            this.analyzeLastGame();
        });
        
        document.getElementById('close-analysis').addEventListener('click', () => {
            this.closeAnalysis();
        });
    }
    
    async analyzeLastGame() {
        const sessionId = game.getLastSessionId();
        
        if (!sessionId) {
            alert('没有找到游戏记录');
            return;
        }
        
        this.showAnalysis();
        this.analysisContent.innerHTML = '<p class="loading">正在分析游戏数据...</p>';
        
        try {
            // 获取游戏会话数据
            const sessionDoc = await db.collection('gameSessions').doc(sessionId).get();
            
            if (!sessionDoc.exists) {
                throw new Error('游戏记录不存在');
            }
            
            const sessionData = sessionDoc.data();
            
            // 生成分析报告
            const analysis = await this.generateAnalysis(sessionData);
            
            this.displayAnalysis(analysis);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.analysisContent.innerHTML = `
                <p style="color: #ff6b6b;">分析失败: ${error.message}</p>
                <p style="margin-top: 10px;">提示：AI分析功能需要配置 OpenAI API Key。</p>
                <p>请在 js/config.js 中设置 openaiConfig.apiKey。</p>
            `;
        }
    }
    
    async generateAnalysis(sessionData) {
        // 如果配置了 OpenAI API，使用真实的 AI 分析
        if (openaiConfig.apiKey && openaiConfig.apiKey !== 'YOUR_OPENAI_API_KEY') {
            return await this.generateAIAnalysis(sessionData);
        } else {
            // 否则使用基于规则的分析
            return this.generateRuleBasedAnalysis(sessionData);
        }
    }
    
    async generateAIAnalysis(sessionData) {
        const prompt = `分析以下 Hextris 游戏数据并提供建议：

游戏时长: ${sessionData.duration.toFixed(2)} 秒
最终分数: ${sessionData.score}
总移动次数: ${sessionData.moves}
方块数量: ${sessionData.blocks}
平均每秒移动: ${(sessionData.moves / sessionData.duration).toFixed(2)}
得分效率: ${(sessionData.score / sessionData.blocks).toFixed(2)} 分/方块

请提供：
1. 整体表现评价
2. 优势分析
3. 改进建议
4. 具体技巧

请用中文回答，简洁明了。`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: openaiConfig.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的游戏分析助手，擅长分析 Hextris 游戏数据并提供有用的建议。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            if (!response.ok) {
                throw new Error(`OpenAI API 错误: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('OpenAI API error:', error);
            // 如果 API 调用失败，回退到基于规则的分析
            return this.generateRuleBasedAnalysis(sessionData);
        }
    }
    
    generateRuleBasedAnalysis(sessionData) {
        const duration = sessionData.duration;
        const score = sessionData.score;
        const moves = sessionData.moves;
        const blocks = sessionData.blocks;
        
        const movesPerSecond = moves / duration;
        const scorePerBlock = score / blocks;
        
        let analysis = `<h4>🎮 游戏表现分析</h4>\n\n`;
        
        // 整体评价
        analysis += `<p><strong>📊 基本数据：</strong></p>\n`;
        analysis += `<ul>\n`;
        analysis += `<li>游戏时长: ${duration.toFixed(2)} 秒</li>\n`;
        analysis += `<li>最终分数: ${score}</li>\n`;
        analysis += `<li>总移动次数: ${moves}</li>\n`;
        analysis += `<li>方块数量: ${blocks}</li>\n`;
        analysis += `</ul>\n\n`;
        
        // 表现评价
        analysis += `<p><strong>⭐ 表现评价：</strong></p>\n`;
        if (score >= 1000) {
            analysis += `<p>🏆 <span style="color: #667eea;">优秀!</span> 你的得分非常高，说明你已经掌握了游戏的核心技巧。</p>\n`;
        } else if (score >= 500) {
            analysis += `<p>👍 <span style="color: #4ECDC4;">良好!</span> 你的表现不错，继续保持就能达到更高分数。</p>\n`;
        } else if (score >= 200) {
            analysis += `<p>💪 <span style="color: #FFA07A;">进步中!</span> 你正在掌握游戏节奏，多练习会有更大提升。</p>\n`;
        } else {
            analysis += `<p>🌱 <span style="color: #98D8C8;">起步阶段!</span> 不要气馁，熟悉游戏机制后会快速进步。</p>\n`;
        }
        
        analysis += `\n`;
        
        // 操作分析
        analysis += `<p><strong>🎯 操作分析：</strong></p>\n`;
        if (movesPerSecond > 3) {
            analysis += `<p>你的操作频率很高 (${movesPerSecond.toFixed(2)} 次/秒)。适当减慢节奏，多观察方块颜色的分布，可能会获得更好的结果。</p>\n`;
        } else if (movesPerSecond < 1) {
            analysis += `<p>你的操作相对较少 (${movesPerSecond.toFixed(2)} 次/秒)。可以尝试更频繁地调整位置，寻找最佳消除机会。</p>\n`;
        } else {
            analysis += `<p>你的操作节奏适中 (${movesPerSecond.toFixed(2)} 次/秒)，继续保持这个节奏。</p>\n`;
        }
        
        analysis += `\n`;
        
        // 效率分析
        analysis += `<p><strong>💡 消除效率：</strong></p>\n`;
        if (scorePerBlock > 50) {
            analysis += `<p>你的消除效率很高 (${scorePerBlock.toFixed(2)} 分/方块)！你很擅长创造连续消除的机会。</p>\n`;
        } else if (scorePerBlock > 30) {
            analysis += `<p>你的消除效率不错 (${scorePerBlock.toFixed(2)} 分/方块)。尝试更多地创造三个以上的连续消除。</p>\n`;
        } else {
            analysis += `<p>你的消除效率还有提升空间 (${scorePerBlock.toFixed(2)} 分/方块)。注意积累相同颜色的方块，等待合适的时机一次性消除。</p>\n`;
        }
        
        analysis += `\n`;
        
        // 改进建议
        analysis += `<p><strong>🚀 改进建议：</strong></p>\n`;
        analysis += `<ul>\n`;
        analysis += `<li>提前观察下一个方块的颜色，规划放置位置</li>\n`;
        analysis += `<li>尽量让相同颜色的方块靠近，创造消除机会</li>\n`;
        analysis += `<li>避免让某一边堆积过多方块</li>\n`;
        analysis += `<li>保持冷静，不要急于旋转</li>\n`;
        analysis += `</ul>\n`;
        
        return analysis;
    }
    
    displayAnalysis(analysis) {
        // 将文本转换为 HTML
        const htmlContent = analysis
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        this.analysisContent.innerHTML = `<div>${htmlContent}</div>`;
    }
    
    showAnalysis() {
        this.analysisPanel.classList.remove('hidden');
    }
    
    closeAnalysis() {
        this.analysisPanel.classList.add('hidden');
    }
}

// 初始化 AI 分析管理器
const aiAnalysisManager = new AIAnalysisManager();
