// GitHub 配置 - 需要替换为你的信息
const GITHUB_CONFIG = {
    // 替换为你的GitHub用户名
    username: 'Fu-cole',
    // 替换为你的仓库名
    repo: 'Fu-03',
    // 替换为你的Personal Access Token
    token: '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'
};

class GitHubLikeSystem {
    constructor() {
        this.likeButton = document.getElementById('likeButton');
        this.likeCount = document.getElementById('likeCount');
        this.likeIcon = this.likeButton.querySelector('i');
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        // 检查用户是否已经点赞
        this.hasVoted = localStorage.getItem('hasVoted') === 'true';
        
        if (this.hasVoted) {
            this.disableLikeButton();
        }
        
        // 获取当前点赞数
        await this.updateLikeCount();
        
        // 绑定点击事件
        this.likeButton.addEventListener('click', () => this.handleLike());
    }
    
    async updateLikeCount() {
        try {
            const issues = await this.fetchIssues();
            const likeIssues = issues.filter(issue => 
                issue.labels.some(label => label.name === 'like')
            );
            
            this.likeCount.textContent = likeIssues.length;
        } catch (error) {
            console.error('获取点赞数失败:', error);
            this.likeCount.textContent = '?';
        }
    }
    
    async fetchIssues() {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/issues?labels=like&state=all`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async handleLike() {
        if (this.hasVoted || this.isLoading) return;
        
        this.isLoading = true;
        this.likeButton.classList.add('loading');
        
        try {
            // 创建点赞issue
            await this.createLikeIssue();
            
            // 更新UI
            this.hasVoted = true;
            localStorage.setItem('hasVoted', 'true');
            this.disableLikeButton();
            this.showMessage('感谢你的点赞！❤️');
            
            // 更新计数
            await this.updateLikeCount();
            
        } catch (error) {
            console.error('点赞失败:', error);
            this.showMessage('点赞失败，请重试', true);
        } finally {
            this.isLoading = false;
            this.likeButton.classList.remove('loading');
        }
    }
    
    async createLikeIssue() {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `❤️ 点赞 - ${new Date().toLocaleString('zh-CN')}`,
                    body: `用户点赞时间: ${new Date().toISOString()}\n\n来自: ${navigator.userAgent}`,
                    labels: ['like']
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(`创建issue失败: ${response.status}`);
        }
        
        return await response.json();
    }
    
    disableLikeButton() {
        this.likeButton.classList.add('liked');
        this.likeButton.innerHTML = '<i class="fas fa-heart"></i><span class="like-count">已点赞</span>';
        this.likeIcon.classList.add('like-animation');
        
        setTimeout(() => {
            this.likeIcon.classList.remove('like-animation');
        }, 500);
    }
    
    showMessage(text, isError = false) {
        const message = document.createElement('div');
        message.className = 'vote-message';
        message.textContent = text;
        message.style.background = isError ? '#ff4757' : '#4CAF50';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// 初始化点赞系统
document.addEventListener('DOMContentLoaded', () => {
    new GitHubLikeSystem();
});
