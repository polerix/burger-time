export default class Enemy {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type; // 'egg', 'wiener'

        this.cellWidth = 35;
        this.cellHeight = 30;

        this.x = col * this.cellWidth;
        this.y = row * this.cellHeight + 65;
        this.width = 35;
        this.height = 30;

        this.speed = 80; // Slower than player
        this.image = new Image();
        if (type === 'egg') this.image.src = 'assets/images/enemy_egg.png';
        else this.image.src = 'assets/images/enemy_wrustel.png';
    }

    reset() {
        this.x = this.col * this.cellWidth;
        this.y = this.row * this.cellHeight + 65;
    }

    update(player, map, deltaTime) {
        // Simple AI: Move towards player
        let dx = 0;
        let dy = 0;

        if (this.x < player.x) dx = 1;
        else if (this.x > player.x) dx = -1;

        if (Math.abs(this.x - player.x) < 10) { // Align X first then Y
            if (this.y < player.y) dy = 1;
            else if (this.y > player.y) dy = -1;
        }

        let nextX = this.x + dx * this.speed * (deltaTime / 1000);
        let nextY = this.y + dy * this.speed * (deltaTime / 1000);

        if (map.isValidMove(nextX, nextY, this.width, this.height)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
