const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;
const JUMP_STRENGTH = -10;
const CACTUS_WIDTH = 20;
const CACTUS_HEIGHT = 30;
const CAT_WIDTH = 40;
const CAT_HEIGHT = 40;

let catY = canvas.height - CAT_HEIGHT - 10;
let catSpeedY = 0;
let isJumping = false;
let isGameOver = false;
let score = 0;

const cat = {
    x: 50,
    y: catY,
    width: CAT_WIDTH,
    height: CAT_HEIGHT,
    color: 'green',
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    jump() {
        if (!isJumping) {
            catSpeedY = JUMP_STRENGTH;
            isJumping = true;
        }
    }
};

let cacti = [];
let cactusSpeed = 3;

function addCactus() {
    let cactusY = canvas.height - CACTUS_HEIGHT - 10;
    let cactusX = canvas.width;
    cacti.push({ x: cactusX, y: cactusY, width: CACTUS_WIDTH, height: CACTUS_HEIGHT });
}

function update() {
    if (isGameOver) return;

  
    cat.y += catSpeedY;
    catSpeedY += GRAVITY;

   
    if (cat.y >= catY) {
        cat.y = catY;
        catSpeedY = 0;
        isJumping = false;
    }

    
    for (let i = 0; i < cacti.length; i++) {
        cacti[i].x -= cactusSpeed;
    }

    
    cacti = cacti.filter(cactus => cactus.x + cactus.width > 0);

   
    for (let i = 0; i < cacti.length; i++) {
        if (
            cat.x + cat.width > cacti[i].x &&
            cat.x < cacti[i].x + cacti[i].width &&
            cat.y + cat.height > cacti[i].y
        ) {
            isGameOver = true;
        }
    }

    
    score++;

    
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cat.draw();

    for (let i = 0; i < cacti.length; i++) {
        ctx.fillStyle = 'red';
        ctx.fillRect(cacti[i].x, cacti[i].y, cacti[i].width, cacti[i].height);
    }


    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    
    if (isGameOver) {
        ctx.fillText('Game Over!', canvas.width / 2 - 60, canvas.height / 2);
    }
}


setInterval(addCactus, 2000);


document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        cat.jump();
    }
});


update();
