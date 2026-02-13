import Game from './game/Game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    // Original game resolution (from analysis of Java code: 21 cols * ? + offsets)
    // GameView.java says WIDTH=735, HEIGHT=1000
    const GAME_WIDTH = 735;
    const GAME_HEIGHT = 1000;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const game = new Game(canvas);

    function resize() {
        // Resize logic to keep aspect ratio and fit window
        const scale = Math.min(
            window.innerWidth / GAME_WIDTH,
            window.innerHeight / GAME_HEIGHT
        );

        canvas.style.width = `${GAME_WIDTH * scale}px`;
        canvas.style.height = `${GAME_HEIGHT * scale}px`;
    }

    window.addEventListener('resize', resize);
    resize();

    // State Management
    let appState = 'HOME'; // HOME, DEMO, PLAYING
    let idleTimer = 0;
    const IDLE_LIMIT = 5 * 60 * 1000; // 5 minutes
    const DEMO_LIMIT = 5 * 60 * 1000; // 5 minutes
    let demoTimer = 0;

    // Start button
    const startBtn = document.getElementById('start-btn');
    const startScreen = document.getElementById('start-screen');

    startBtn.addEventListener('click', startGame);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && appState === 'HOME') {
            startGame();
        }
        handleInput();
    });

    window.addEventListener('mousemove', handleInput);
    window.addEventListener('touchstart', handleInput);
    window.addEventListener('click', handleInput);

    function handleInput() {
        if (appState === 'HOME') {
            idleTimer = 0;
        } else if (appState === 'DEMO') {
            stopDemoMode();
        }
    }

    function startGame() {
        if (appState === 'PLAYING') return;
        appState = 'PLAYING';
        startScreen.style.display = 'none';
        game.start();
    }

    function startDemoMode() {
        appState = 'DEMO';
        startScreen.style.display = 'none';
        game.startDemo();
        demoTimer = 0;
    }

    function stopDemoMode() {
        appState = 'HOME';
        game.stopDemo();
        startScreen.style.display = 'flex'; // Restore start screen
        idleTimer = 0;
    }

    // Idle Loop
    setInterval(() => {
        if (appState === 'HOME') {
            idleTimer += 1000;
            if (idleTimer >= IDLE_LIMIT) {
                startDemoMode();
            }
        } else if (appState === 'DEMO') {
            demoTimer += 1000;
            if (demoTimer >= DEMO_LIMIT) {
                stopDemoMode();
            }
        }
    }, 1000);

    // Initial State is HOME
    // Ensure game is initialized but not started
    // game.draw(); // Optional: draw generic background?

});
