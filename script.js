// 获取DOM元素
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultDisplay = document.getElementById('resultDisplay');
const resetOptionsButton = document.getElementById('resetOptionsButton');

// 获取设置元素
const spinSpeedInput = document.getElementById('spinSpeed');
const spinDurationInput = document.getElementById('spinDuration');
const soundEnabledInput = document.getElementById('soundEnabled');
const soundThemeSelect = document.getElementById('soundTheme');
const startSoundSelect = document.getElementById('startSoundSelect');
const spinningSoundSelect = document.getElementById('spinningSoundSelect');
const endingSoundSelect = document.getElementById('endingSoundSelect');
const soundSettingsGroup = document.getElementById('soundSettingsGroup');
const confettiEnabledInput = document.getElementById('confettiEnabled');

// 获取选项输入
const optionInputs = [];
const optionColors = [];
for (let i = 1; i <= 8; i++) {
    optionInputs.push(document.getElementById(`option${i}`));
    optionColors.push(document.getElementById(`color${i}`));
}

// 初始化变量
let spinning = false;
let currentRotation = 0;
let spinSpeed = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let tickInterval = null;

// 固定的YES/NO选项
const wheelOptions = [
    { text: "YES", color: "#4CAF50" },
    { text: "NO", color: "#F44336" },
    { text: "YES", color: "#4CAF50" },
    { text: "NO", color: "#F44336" },
    { text: "YES", color: "#4CAF50" },
    { text: "NO", color: "#F44336" },
    { text: "YES", color: "#4CAF50" },
    { text: "NO", color: "#F44336" }
];

// 音效库
const soundLibrary = {
    // 主题包
    themes: {
        default: {
            start: 'default',
            spinning: 'default',
            ending: 'default'
        },
        halloween: {
            start: 'spooky',
            spinning: 'creepy',
            ending: 'ghostly'
        },
        cheerful: {
            start: 'happy',
            spinning: 'playful',
            ending: 'tada'
        },
        space: {
            start: 'beep',
            spinning: 'digital',
            ending: 'chime'
        }
    },
    
    // 开始音效
    start: {
        default: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3',
        click: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
        beep: 'https://assets.mixkit.co/active_storage/sfx/146/146-preview.mp3',
        chime: 'https://assets.mixkit.co/active_storage/sfx/665/665-preview.mp3',
        happy: 'https://assets.mixkit.co/active_storage/sfx/220/220-preview.mp3',
        spooky: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3'
    },
    
    // 旋转中音效 (滴答声)
    spinning: {
        default: 'https://soundbible.com/mp3/analog-watch-ticking-14416.mp3', // DeepFrozenApps tick.mp3
        click: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
        digital: 'https://assets.mixkit.co/active_storage/sfx/2301/2301-preview.mp3',
        soft: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
        playful: 'https://assets.mixkit.co/active_storage/sfx/1018/1018-preview.mp3',
        creepy: 'https://assets.mixkit.co/active_storage/sfx/2152/2152-preview.mp3'
    },
    
    // 结束音效
    ending: {
        default: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_bb630cc098.mp3', // Positive Orchestral Jingle
        tada: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
        chime: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
        bell: 'https://assets.mixkit.co/active_storage/sfx/1862/1862-preview.mp3',
        ghostly: 'https://assets.mixkit.co/active_storage/sfx/167/167-preview.mp3'
    }
};

// 当前音效
let currentSounds = {
    start: null,
    spinning: null,
    ending: null
};

// 预加载所有音效
const soundCache = {};

function preloadSounds() {
    // 预加载开始音效
    soundCache.start = {};
    for (const [key, url] of Object.entries(soundLibrary.start)) {
        soundCache.start[key] = new Audio(url);
    }
    
    // 预加载旋转音效
    soundCache.spinning = {};
    for (const [key, url] of Object.entries(soundLibrary.spinning)) {
        soundCache.spinning[key] = new Audio(url);
        soundCache.spinning[key].volume = 0.5;
    }
    
    // 预加载结束音效
    soundCache.ending = {};
    for (const [key, url] of Object.entries(soundLibrary.ending)) {
        soundCache.ending[key] = new Audio(url);
    }
}

// 更新当前音效
function updateCurrentSounds() {
    if (soundThemeSelect.value !== 'default') {
        // 如果选择了主题，使用主题的音效设置
        const theme = soundThemeSelect.value;
        const themeSettings = soundLibrary.themes[theme];
        
        currentSounds.start = soundCache.start[themeSettings.start];
        currentSounds.spinning = soundCache.spinning[themeSettings.spinning];
        currentSounds.ending = soundCache.ending[themeSettings.ending];
        
        // 更新选择器值以匹配主题
        startSoundSelect.value = themeSettings.start;
        spinningSoundSelect.value = themeSettings.spinning;
        endingSoundSelect.value = themeSettings.ending;
    } else {
        // 如果是默认主题，使用用户的自定义选择
        currentSounds.start = soundCache.start[startSoundSelect.value];
        currentSounds.spinning = soundCache.spinning[spinningSoundSelect.value];
        currentSounds.ending = soundCache.ending[endingSoundSelect.value];
    }
}

// 初始化轮盘
function initWheel() {
    drawWheel();
    
    // 更新声音设置面板的可见性
    soundSettingsGroup.style.display = soundEnabledInput.checked ? 'block' : 'none';
}

// 绘制轮盘
function drawWheel() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置轮盘中心点
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // 设置轮盘样式
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);
    
    // 绘制轮盘扇形
    const numSegments = wheelOptions.length;
    const segmentAngle = 2 * Math.PI / numSegments;
    
    for (let i = 0; i < numSegments; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * segmentAngle, (i + 1) * segmentAngle);
        ctx.closePath();
        
        // 设置扇形颜色
        ctx.fillStyle = wheelOptions[i].color;
        ctx.fill();
        
        // 添加文字
        ctx.save();
        ctx.rotate(i * segmentAngle + segmentAngle / 2);
        ctx.translate(radius / 2, 0);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Poppins';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(wheelOptions[i].text, 0, 0);
        ctx.restore();
    }
    
    // 绘制轮盘中心圆
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    
    ctx.restore();
}

// 播放滴答声
function playTickSound() {
    if (soundEnabledInput.checked) {
        // 为了避免连续播放导致声音重叠，克隆一个新的音频对象
        const tickClone = new Audio(currentSounds.spinning.src);
        tickClone.volume = 0.3;
        tickClone.play();
    }
}

// 开始滴答声
function startTickSound() {
    if (soundEnabledInput.checked) {
        // 根据速度调整滴答声间隔
        const tickSpeed = Math.max(50, 200 - spinSpeed);
        clearInterval(tickInterval);
        tickInterval = setInterval(playTickSound, tickSpeed);
    }
}

// 停止滴答声
function stopTickSound() {
    clearInterval(tickInterval);
}

// 旋转轮盘
function rotateWheel() {
    spinTime += 30;
    
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    
    // 计算旋转角度，使用easeOut效果
    const spinFactor = easeOut(spinTime, 0, spinSpeed, spinTimeTotal);
    currentRotation += (spinFactor * Math.PI / 180);
    
    // 绘制轮盘
    drawWheel();
    
    // 继续动画
    requestAnimationFrame(rotateWheel);
}

// 停止轮盘旋转
function stopRotateWheel() {
    spinning = false;
    
    // 停止滴答声
    stopTickSound();
    
    // 播放结果音效
    if (soundEnabledInput.checked && currentSounds.ending) {
        currentSounds.ending.currentTime = 0;
        currentSounds.ending.play();
    }
    
    // 计算结果
    const degrees = currentRotation * 180 / Math.PI % 360;
    const normalizedDegrees = degrees < 0 ? degrees + 360 : degrees;
    
    // 确定选中的扇形
    const numSegments = wheelOptions.length;
    const segmentAngle = 360 / numSegments;
    const selectedSegment = Math.floor(normalizedDegrees / segmentAngle);
    const result = wheelOptions[selectedSegment].text;
    const resultColor = wheelOptions[selectedSegment].color;
    
    // 显示结果
    resultDisplay.textContent = result;
    resultDisplay.style.color = resultColor;
    
    // 显示彩色纸屑效果
    if (confettiEnabledInput.checked) {
        showConfetti();
    }
    
    // 启用旋转按钮
    spinButton.disabled = false;
}

// 缓动函数
function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

// 开始旋转
function startSpin() {
    if (spinning) return;
    
    // 重置结果显示
    resultDisplay.textContent = '';
    
    // 禁用旋转按钮
    spinButton.disabled = true;
    
    // 设置旋转参数
    spinning = true;
    spinTime = 0;
    spinSpeed = 50 + parseInt(spinSpeedInput.value) * 10; // 基础速度加上用户设置
    spinTimeTotal = 1000 + parseInt(spinDurationInput.value) * 500; // 基础时间加上用户设置
    
    // 更新当前音效
    updateCurrentSounds();
    
    // 播放开始音效
    if (soundEnabledInput.checked && currentSounds.start) {
        currentSounds.start.currentTime = 0;
        currentSounds.start.play();
    }
    
    // 开始滴答声
    startTickSound();
    
    // 开始旋转动画
    rotateWheel();
}

// 彩色纸屑效果
function showConfetti() {
    const confettiCount = 200;
    const confettiColors = ["#4CAF50", "#F44336"]; // 只使用YES和NO的颜色
    
    for (let i = 0; i < confettiCount; i++) {
        createConfettiParticle(confettiColors[Math.floor(Math.random() * confettiColors.length)]);
    }
}

// 创建单个纸屑粒子
function createConfettiParticle(color) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 8 + 4 + 'px';
    particle.style.height = Math.random() * 8 + 4 + 'px';
    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    
    // 设置粒子初始位置
    const wheel = canvas.getBoundingClientRect();
    const centerX = wheel.left + wheel.width / 2;
    const centerY = wheel.top + wheel.height / 2;
    
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    
    document.body.appendChild(particle);
    
    // 粒子动画
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 5 + 5;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let posX = centerX;
    let posY = centerY;
    let opacity = 1;
    let gravity = 0.1;
    
    const animateParticle = () => {
        posX += vx;
        posY += vy;
        vy += gravity;
        opacity -= 0.02;
        
        particle.style.left = posX + 'px';
        particle.style.top = posY + 'px';
        particle.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animateParticle);
        } else {
            particle.remove();
        }
    };
    
    requestAnimationFrame(animateParticle);
}

// 主题选择事件处理
soundThemeSelect.addEventListener('change', function() {
    if (this.value !== 'default') {
        // 如果选择了主题包，更新音效设置并禁用单独选择
        updateCurrentSounds();
        startSoundSelect.disabled = true;
        spinningSoundSelect.disabled = true;
        endingSoundSelect.disabled = true;
    } else {
        // 如果选择了默认，允许单独选择音效
        startSoundSelect.disabled = false;
        spinningSoundSelect.disabled = false;
        endingSoundSelect.disabled = false;
    }
});

// 单独音效选择事件处理
startSoundSelect.addEventListener('change', function() {
    if (soundThemeSelect.value === 'default') {
        updateCurrentSounds();
    }
});

spinningSoundSelect.addEventListener('change', function() {
    if (soundThemeSelect.value === 'default') {
        updateCurrentSounds();
    }
});

endingSoundSelect.addEventListener('change', function() {
    if (soundThemeSelect.value === 'default') {
        updateCurrentSounds();
    }
});

// 监听声音设置的变化
soundEnabledInput.addEventListener('change', function() {
    soundSettingsGroup.style.display = this.checked ? 'block' : 'none';
});

// 添加旋转按钮事件监听器
spinButton.addEventListener('click', startSpin);

// 预加载音效并初始化轮盘
window.addEventListener('load', function() {
    preloadSounds();
    updateCurrentSounds();
    initWheel();
});

// 添加移动端触摸事件支持
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
});

// 响应式调整
window.addEventListener('resize', function() {
    // 重新绘制轮盘
    drawWheel();
}); 