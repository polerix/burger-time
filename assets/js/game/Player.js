export default class Player {
    constructor(game) {
        this.game = game;
        this.cellWidth = 35; // Derived from GameView.java imageSizeX
        this.cellHeight = 30; // Derived from GameView.java imageSizeY
        this.width = 35;
        this.height = 30; // Match grid size for easier collision initially

        this.x = 0;
        this.y = 0;

        this.speed = 150; // Pixels per second
        this.image = new Image();
        this.image.src = 'assets/images/chef.png';

        this.frameX = 0;
        this.maxFrame = 3; // Assuming sprint sheet has frames
        this.fps = 10;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;

        // Control State
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.onGround = true;
        this.pepperCooldown = 0;
    }

    resetPosition(pos) {
        this.x = pos.col * this.cellWidth;
        this.y = pos.row * this.cellHeight + 65; // Offset Y from GameView
    }

    update(input, map, deltaTime) {
        let dx = 0;
        let dy = 0;

        if (input.keys.includes('ArrowUp') || input.keys.includes('w') || input.keys.includes('W')) dy = -1;
        else if (input.keys.includes('ArrowDown') || input.keys.includes('s') || input.keys.includes('S')) dy = 1;
        else if (input.keys.includes('ArrowLeft') || input.keys.includes('a') || input.keys.includes('A')) dx = -1;
        else if (input.keys.includes('ArrowRight') || input.keys.includes('d') || input.keys.includes('D')) dx = 1;

        if (input.keys.includes(' ') && !this.isJumping) {
            // Jump logic placeholder
            // BurgerTime doesn't have jump, but user requested it.
            // We can maybe just do a small hop visual or skip logic if not feasible without gravity
            // For now, let's log it or maybe just ignore if gravity isn't implemented?
            // Actually, let's just make it a "Jump" action that valid only on floors?
            // But there is no gravity in `update`...
            // If I add gravity, I break the ladder logic potentially.
            // I will leave jump as a 'todo' or visual hop?
            console.log("Jump requested");
        }

        if (input.keys.includes('Enter')) {
            console.log("Pepper fired!");
            // TODO: Implement pepper logic
        }

        // Jump Logic
        if (input.keys.includes(' ') && !this.isJumping && this.onGround) {
            this.isJumping = true;
            this.jumpVelocity = -10; // Initial jump force
            this.onGround = false;
        }

        if (this.isJumping) {
            this.y += this.jumpVelocity;
            this.jumpVelocity += 0.5; // Gravity

            // Check landing manually for now since we don't have full physics
            // This is a hacky jump for a grid game, but requested by user.
            // We need to check if we landed back on a valid cell row basically.

            if (this.jumpVelocity > 0) { // Falling
                // Check if we are near a row center
                let row = Math.round((this.y - 65) / this.cellHeight);
                let targetY = row * this.cellHeight + 65;

                if (this.y >= targetY && map.isValidMove(this.x, targetY, this.width, this.height)) {
                    this.y = targetY;
                    this.isJumping = false;
                    this.onGround = true;
                    this.jumpVelocity = 0;
                }
            }
        }

        // Pepper Logic
        if (input.keys.includes('Enter') && this.pepperCooldown <= 0) {
            console.log("Pepper fired!");
            this.pepperCooldown = 500; // 0.5s cooldown
            // TODO: Spawn pepper entity or hitbox
        }
        if (this.pepperCooldown > 0) this.pepperCooldown -= deltaTime;


        // Grid-based movement logic (simplified for prototype)
        // We need to check if the center of the player + direction is a valid cell

        // Determine grid coordinates
        let col = Math.round(this.x / this.cellWidth);
        // let row = Math.round((this.y - 65) / this.cellHeight);

        // Movement Logic
        // Calculate potential new position
        // Only allow movement if not mid-air? Or allow air control? 
        // Original didn't have jump, so let's allow air control for fun.

        let nextX = this.x + dx * this.speed * (deltaTime / 1000);
        let nextY = this.y + dy * this.speed * (deltaTime / 1000);

        // Check collision with map boundaries
        if (nextX < 0) nextX = 0;
        if (nextX > this.game.width - this.width) nextX = this.game.width - this.width;

        /* 
           Refined Logic:
           - If moving Horizontal: Check if current Y is aligned with a row center. if so, check if target X is valid floor.
           - If moving Vertical: Check if current X is aligned with a col center. if so, check if target Y is valid ladder.
        */

        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;

        // Disable vertical movement if jumping
        if (this.isJumping) {
            nextY = this.y; // Keep Y controlled by jump physics
        }

        if (map.isValidMove(nextX, nextY, this.width, this.height)) {
            this.x = nextX;
            // Only update Y if not jumping (handled above)
            if (!this.isJumping) this.y = nextY;
        }

        // Animation
        if (dx !== 0 || dy !== 0) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
        }
    }

    draw(ctx) {
        // Draw sprite
        // ctx.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);

        // Placeholder for now as we don't know exact sprite sheet layout
        ctx.drawImage(this.image, this.x, this.y, this.cellWidth, 40); // Adjusted height for visuals
    }
}
