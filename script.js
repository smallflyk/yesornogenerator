document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const yesCount = document.getElementById('yes-count');
    const noCount = document.getElementById('no-count');
    const maybeCount = document.getElementById('maybe-count');
    const maybeContainer = document.getElementById('maybe-container');
    const yesNoBtn = document.getElementById('yes-no-btn');
    const yesNoMaybeBtn = document.getElementById('yes-no-maybe-btn');
    const numberBtns = document.querySelectorAll('.number-btn');
    
    // Variables
    let spinning = false;
    let currentMode = 'yes-no'; // 'yes-no' or 'yes-no-maybe'
    let yesCounter = 0;
    let noCounter = 0;
    let maybeCounter = 0;
    
    // Initialize wheel segments
    initializeWheel();
    
    // Event Listeners
    spinButton.addEventListener('click', spinWheel);
    
    yesNoBtn.addEventListener('click', function() {
        setMode('yes-no');
    });
    
    yesNoMaybeBtn.addEventListener('click', function() {
        setMode('yes-no-maybe');
    });
    
    numberBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            numberBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Add keyboard shortcut for spinning (Ctrl + Enter)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter' && !spinning) {
            spinWheel();
        }
    });
    
    // Functions
    function initializeWheel() {
        if (currentMode === 'yes-no') {
            wheel.innerHTML = `
                <div class="segment yes">YES</div>
                <div class="segment no">NO</div>
            `;
            maybeContainer.style.display = 'none';
        } else {
            wheel.innerHTML = `
                <div class="segment yes" style="width: 33.33%; left: 0;">YES</div>
                <div class="segment maybe" style="width: 33.33%; left: 33.33%; background-color: #FFC107;">MAYBE</div>
                <div class="segment no" style="width: 33.33%; left: 66.66%;">NO</div>
            `;
            maybeContainer.style.display = 'flex';
        }
    }
    
    function setMode(mode) {
        if (mode === currentMode) return;
        
        currentMode = mode;
        
        if (mode === 'yes-no') {
            yesNoBtn.classList.add('active');
            yesNoMaybeBtn.classList.remove('active');
        } else {
            yesNoBtn.classList.remove('active');
            yesNoMaybeBtn.classList.add('active');
        }
        
        initializeWheel();
    }
    
    function spinWheel() {
        if (spinning) return;
        
        spinning = true;
        
        // 当前转盘角度（如果有）
        let currentRotation = 0;
        const transformValue = wheel.style.transform;
        if (transformValue) {
            const match = transformValue.match(/rotate\(([0-9.]+)deg\)/);
            if (match && match[1]) {
                currentRotation = parseFloat(match[1]);
            }
        }
        
        // 生成新的旋转角度 - 始终确保至少旋转2圈并按顺时针方向
        const minRotation = 720; // 最小旋转两圈
        let result;
        let resultAngle;
        
        if (currentMode === 'yes-no') {
            // 确定结果
            result = Math.random() < 0.5 ? 'yes' : 'no';
            
            // 确定目标角度 - 0度为12点钟方向
            if (result === 'yes') {
                resultAngle = 270; // YES在左侧
            } else {
                resultAngle = 90; // NO在右侧
            }
        } else {
            // 确定结果
            const random = Math.random();
            if (random < 0.33) {
                result = 'yes';
                resultAngle = 240; // YES
            } else if (random < 0.66) {
                result = 'maybe';
                resultAngle = 0; // MAYBE
            } else {
                result = 'no';
                resultAngle = 120; // NO
            }
        }
        
        // 计算总旋转角度，确保顺时针方向（角度增加）
        // 通过增加回转圈数确保顺时针旋转
        let totalRotation = minRotation + resultAngle;
        
        // 如果有当前角度，确保新角度大于当前角度以保证顺时针旋转
        if (currentRotation > 0) {
            // 计算需要新增的角度使结果为resultAngle
            const normalizedCurrentAngle = currentRotation % 360;
            let additionalAngle = resultAngle - normalizedCurrentAngle;
            
            // 如果需要逆时针旋转才能到目标角度，则增加一圈
            if (additionalAngle < 0) {
                additionalAngle += 360;
            }
            
            // 最终旋转角度 = 当前角度 + 最小旋转角度 + 附加角度
            totalRotation = currentRotation + minRotation + additionalAngle;
        }
        
        // 应用旋转到转盘
        wheel.style.transform = `rotate(${totalRotation}deg)`;
        
        // 更新计数器
        setTimeout(() => {
            updateCounters(result);
            spinning = false;
        }, 1000); // 与CSS过渡时间匹配
    }
    
    function updateCounters(result) {
        if (result === 'yes') {
            yesCounter++;
            yesCount.textContent = yesCounter;
        } else if (result === 'no') {
            noCounter++;
            noCount.textContent = noCounter;
        } else if (result === 'maybe') {
            maybeCounter++;
            maybeCount.textContent = maybeCounter;
        }
        
        // Show result message
        showResultMessage(result);
    }
    
    function showResultMessage(result) {
        // Create a message element
        const messageElement = document.createElement('div');
        messageElement.className = 'result-message';
        messageElement.textContent = result.toUpperCase();
        
        // Style based on result
        if (result === 'yes') {
            messageElement.style.backgroundColor = '#4CAF50';
        } else if (result === 'no') {
            messageElement.style.backgroundColor = '#FF5252';
        } else {
            messageElement.style.backgroundColor = '#FFC107';
        }
        
        // Apply styles
        Object.assign(messageElement.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px 40px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px',
            zIndex: '1000',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            opacity: '0',
            transition: 'opacity 0.3s'
        });
        
        // Add to body
        document.body.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.style.opacity = '1';
        }, 10);
        
        // Remove after 2 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 2000);
    }
    
    // Add functionality for tool settings toggle
    const toolSettings = document.querySelector('.tool-settings-header');
    toolSettings.addEventListener('click', function() {
        // This would normally toggle the visibility of settings content
        alert('Settings panel would expand here in the full implementation');
    });
    
    // Toggle inputs section visibility
    function createHideInputsButton() {
        const hideBtn = document.createElement('button');
        hideBtn.className = 'hide-inputs-btn';
        hideBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        hideBtn.title = 'Hide/Show Inputs';
        
        Object.assign(hideBtn.style, {
            position: 'absolute',
            bottom: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            zIndex: '10'
        });
        
        const inputsSection = document.querySelector('.inputs-section');
        inputsSection.style.position = 'relative';
        inputsSection.appendChild(hideBtn);
        
        let hidden = false;
        hideBtn.addEventListener('click', function() {
            if (hidden) {
                inputsSection.style.maxHeight = 'none';
                inputsSection.style.overflow = 'visible';
                this.innerHTML = '<i class="fas fa-chevron-up"></i>';
                hidden = false;
            } else {
                inputsSection.style.maxHeight = '40px';
                inputsSection.style.overflow = 'hidden';
                this.innerHTML = '<i class="fas fa-chevron-down"></i>';
                hidden = true;
            }
        });
    }
    
    // Create reset button
    function createResetButton() {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.innerHTML = '<i class="fas fa-redo"></i> Reset';
        resetBtn.title = 'Reset Results';
        
        Object.assign(resetBtn.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: 'pointer'
        });
        
        const resultsSection = document.querySelector('.results-section');
        resultsSection.style.position = 'relative';
        resultsSection.appendChild(resetBtn);
        
        resetBtn.addEventListener('click', function() {
            yesCounter = 0;
            noCounter = 0;
            maybeCounter = 0;
            yesCount.textContent = '0';
            noCount.textContent = '0';
            maybeCount.textContent = '0';
        });
    }
    
    // Create "Open All Results" button
    function createOpenAllResultsButton() {
        const openBtn = document.createElement('button');
        openBtn.className = 'open-results-btn';
        openBtn.innerHTML = 'Open All Results';
        
        Object.assign(openBtn.style, {
            marginTop: '20px',
            padding: '10px 15px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto'
        });
        
        const wheelContainer = document.querySelector('.wheel-container');
        wheelContainer.appendChild(openBtn);
        
        openBtn.addEventListener('click', function() {
            alert('This would show all past results in the full implementation');
        });
    }
    
    // Initialize additional UI elements
    createHideInputsButton();
    createResetButton();
    createOpenAllResultsButton();
    
    // Add full screen functionality
    function createFullScreenButton() {
        const fullScreenBtn = document.createElement('button');
        fullScreenBtn.className = 'fullscreen-btn';
        fullScreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullScreenBtn.title = 'Toggle Full Screen';
        
        Object.assign(fullScreenBtn.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            zIndex: '10'
        });
        
        const wheelSection = document.querySelector('.wheel-section');
        wheelSection.style.position = 'relative';
        wheelSection.appendChild(fullScreenBtn);
        
        let isFullScreen = false;
        fullScreenBtn.addEventListener('click', function() {
            if (!isFullScreen) {
                // Request full screen
                const container = document.querySelector('.container');
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                }
                
                fullScreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                isFullScreen = true;
            } else {
                // Exit full screen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                
                fullScreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                isFullScreen = false;
            }
        });
    }
    
    createFullScreenButton();
}); 