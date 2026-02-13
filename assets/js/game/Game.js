import Player from './Player.js';
import Map from './Map.js';
import Enemy from './Enemy.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.lastTime = 0;
        this.score = 0;
        this.highScore = 20000;
        this.lives = 4;

        this.map = new Map(1); // Load level 1
        this.player = new Player(this);
        this.enemies = []; // Will be populated by Map

        this.input = {
            keys: [],
            touch: null
        };

        this.bindControls();

        this.isGameOver = false;
        this.isPaused = false;
        this.isDemo = false;
        this.demoTimer = 0;
        this.demoInput = { keys: [] };
    }

    startDemo() {
        this.isDemo = true;
        this.isGameOver = false;
        this.score = 0;
        this.lives = 4;
        this.map.load().then(() => {
            this.player.resetPosition(this.map.getStartPosition());
            this.enemies = this.map.getEnemies();
            this.gameLoop(0);
        });
    }

    stopDemo() {
        this.isDemo = false;
        this.isGameOver = true; // Stop the loop
        // We don't reload, just stop updates?
        // Actually, main.js will control visibility.
        // We just need to stop the loop or rely on main.js to re-init.
    }

    start() {
        this.isDemo = false;
        this.isGameOver = false;
        this.score = 0;
        this.lives = 4;
        this.map.load().then(() => {
            this.player.resetPosition(this.map.getStartPosition());
            this.enemies = this.map.getEnemies();
            this.gameLoop(0);
        });
    }

    gameLoop(timeStamp) {
        if (this.isGameOver) return;

        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        if (this.isDemo) {
            this.updateDemoInput(deltaTime);
            this.player.update(this.demoInput, this.map, deltaTime);
        } else {
            this.player.update(this.input, this.map, deltaTime);
        }
        this.enemies.forEach(enemy => enemy.update(this.player, this.map, deltaTime));

        // Check Collisions
        this.checkCollisions();

        // Update UI
        document.getElementById('score').innerText = this.score;
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.map.draw(this.ctx);
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
    }

    checkCollisions() {
        // Player vs Enemies
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy)) {
                this.handleDeath();
            }
        });
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    handleDeath() {
        this.lives--;
        if (this.lives <= 0) {
            if (this.isDemo) {
                // Silent reset for demo
                this.startDemo();
            } else {
                this.isGameOver = true;
                alert("GAME OVER");
                location.reload();
            }
        } else {
            this.player.resetPosition(this.map.getStartPosition());
            this.enemies.forEach(e => e.reset());
        }
    }

    updateDemoInput(deltaTime) {
        this.demoTimer += deltaTime;
        if (this.demoTimer > 1000) { // Change direction every second
            this.demoTimer = 0;
            const moves = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            this.demoInput.keys = [randomMove];
        }
    }

    bindControls() {
        window.addEventListener('keydown', e => {
            const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
            if (keys.includes(e.key) && this.input.keys.indexOf(e.key) === -1) {
                this.input.keys.push(e.key);
                // Prevent default scrolling for arrows and space
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            const index = this.input.keys.indexOf(e.key);
            if (index > -1) {
                this.input.keys.splice(index, 1);
            }
        });

        // Touch controls
        const touchBtns = document.querySelectorAll('.d-btn');
        touchBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const key = this.mapBtnToKey(btn.id);
                if (this.input.keys.indexOf(key) === -1) this.input.keys.push(key);
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const key = this.mapBtnToKey(btn.id);
                const index = this.input.keys.indexOf(key);
                if (index > -1) this.input.keys.splice(index, 1);
            });
        });
    }

    mapBtnToKey(id) {
        switch (id) {
            case 'btn-up': return 'ArrowUp';
            case 'btn-down': return 'ArrowDown';
            case 'btn-left': return 'ArrowLeft';
            case 'btn-right': return 'ArrowRight';
            default: return '';
        }
    }
}
