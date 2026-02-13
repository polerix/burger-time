import Enemy from './Enemy.js';

export default class Map {
    constructor(levelIndex) {
        this.levelIndex = levelIndex;
        // 26 rows, 21 cols
        this.rows = 26;
        this.cols = 21;
        this.cellWidth = 35;
        this.cellHeight = 30;
        this.offsetY = 65;

        this.grid = [];
        this.assets = {
            tile: new Image(),
            stair: new Image(),
            tileStair: new Image(),
            burger: {
                top: new Image(),
                salad: new Image(),
                meat: new Image(),
                tomato: new Image(),
                sauce: new Image(),
                bottom: new Image()
            }
        };

        this.assets.tile.src = 'assets/images/tile.png';
        this.assets.stair.src = 'assets/images/stair.png';
        this.assets.tileStair.src = 'assets/images/tileStair.png';

        // Donair Ingredients
        this.assets.burger.top.src = 'assets/images/u_pita_01.png';
        this.assets.burger.salad.src = 'assets/images/onions_01.png'; // Replaces Salad
        this.assets.burger.meat.src = 'assets/images/meat_01.png';
        this.assets.burger.tomato.src = 'assets/images/tomato_01.png';
        this.assets.burger.sauce.src = 'assets/images/sauce_01.png';
        this.assets.burger.bottom.src = 'assets/images/d_pita_01.png';
    }

    async load() {
        // '0' = Empty
        // '1' = Floor
        // '|' = Ladder
        // 'p' = Player Start
        // 'u' = Top Pita
        // 'a' = Sauce
        // 't' = Tomato
        // 's' = Onions
        // 'h' = Meat
        // 'd' = Bottom Pita

        const level1 = [
            "000000000000000000000",
            "000000000000000000000",
            "0u000u000u000u0000000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0a000a000a000a000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0t000t000t000t000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0s000s000s000s000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0h000h000h000h000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0d000d000d000d000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0p00020003000|000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0000000000000|000|000",
            "0000000000000|000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "000000000000000000000",
            "000000000000000000000"
        ];

        this.parseLevel(level1);
    }

    parseLevel(levelData) {
        this.grid = [];
        this.enemies = [];
        this.startPos = { row: 0, col: 0 };
        // Increase rows slightly if needed for the larger stack
        this.rows = levelData.length;

        for (let r = 0; r < this.rows; r++) {
            let rowStr = levelData[r] || "000000000000000000000";
            let rowData = [];

            for (let c = 0; c < this.cols; c++) {
                let char = rowStr[c];

                if (char === 'H') char = '1'; // 1 for Floor

                if (char === 'p') {
                    this.startPos = { row: r, col: c };
                    char = '0'; // Replace with empty
                }
                if (char === '2') {
                    this.enemies.push({ row: r, col: c, type: 'egg' });
                    char = '1'; // Assume on floor
                }
                if (char === '3') {
                    this.enemies.push({ row: r, col: c, type: 'wiener' });
                    char = '1'; // Assume on floor
                }

                rowData.push(char);
            }
            this.grid.push(rowData);
        }
    }

    draw(ctx) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let cell = this.grid[r][c];
                let x = c * this.cellWidth;
                let y = r * this.cellHeight + this.offsetY;

                if (cell === 'H' || cell === '1') {
                    ctx.drawImage(this.assets.tile, x, y, this.cellWidth, this.cellHeight);
                } else if (cell === '|') {
                    ctx.drawImage(this.assets.stair, x, y, this.cellWidth, this.cellHeight);
                } else if (['u', 'h', 's', 'd', 't', 'a'].includes(cell)) {
                    // Draw floor under component?
                    ctx.drawImage(this.assets.tile, x, y, this.cellWidth, this.cellHeight);
                    // Draw component
                    let img = this.getComponentImage(cell);
                    if (img) ctx.drawImage(img, x, y - 5, this.cellWidth, this.cellHeight);
                }
            }
        }
    }

    getComponentImage(code) {
        switch (code) {
            case 'u': return this.assets.burger.top;
            case 's': return this.assets.burger.salad;
            case 'h': return this.assets.burger.meat;
            case 'd': return this.assets.burger.bottom;
            case 't': return this.assets.burger.tomato;
            case 'a': return this.assets.burger.sauce;
            default: return null;
        }
    }

    checkBurgerFall(player) {
        // TODO: Implement burger dropping logic
        // Check if player walked over all parts of a burger segment
    }

    isValidMove(x, y, w, h) {
        // Simple center point check for now
        let cx = x + w / 2;
        let cy = y + h / 2 - this.offsetY;

        let c = Math.floor(cx / this.cellWidth);
        let r = Math.floor(cy / this.cellHeight);

        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;

        let cell = this.grid[r][c];

        // Strict collision logic based on original game rules:
        // - '0': Empty (air/wall) - Cannot move here.
        // - '1' (Floor): Can move Left/Right.
        // - '|' (Ladder): Can move Up/Down.
        // - Intersection ('1' & '|'): Can move all directions? 
        //   My grid parsing separates them. I need to know if a cell supports specific movement.

        // Let's assume:
        // Horizontal movement allowed if current cell OR target cell is '1' (Floor) or Component.
        // Vertical movement allowed if current cell OR target cell is '|' (Ladder).

        // Get current cell info (approximate)
        // Center check is decent for now.

        // Debug:
        // console.log(`Checking Move: ${c},${r} = ${cell}`);

        if (['1', 'u', 'd', 's', 'h', 't', 'a'].includes(cell)) return true; // Floor or Burger
        if (cell === '|') return true; // Ladder

        return false;
    }

    getStartPosition() {
        return this.startPos;
    }

    getEnemies() {
        let enemiesObjs = [];
        this.enemies.forEach(e => {
            enemiesObjs.push(new Enemy(e.row, e.col, e.type));
        });
        return enemiesObjs;
    }
}
