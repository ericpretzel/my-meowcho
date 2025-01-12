let screen_width = 800;
let screen_height = 600;
let basket_width = 100;
let basket_height = 50;
let basket_x;
let basket_y;
let basket_speed = 7;

let yarn_width = 30;
let yarn_height = 30;
let yarn_speed = 4;

let red = [255, 0, 0];
let black = [0, 0, 0];
let white = [255, 255, 255];
let yellow = [255, 255, 0];
let score = 0;

let yarn_x;
let yarn_y;

function setup() {
    createCanvas(screen_width, screen_height);
    basket_x = screen_width / 2 - basket_width / 2;
    basket_y = screen_height - basket_height - 20;
    yarn_x = Math.floor(Math.random() * (screen_width - yarn_width));
    yarn_y = -yarn_height;
}

function draw() {
    background(white);
    
    if (keyIsDown(LEFT_ARROW)) {
        basket_x -= basket_speed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        basket_x += basket_speed;
    }
    
    if (basket_x < 0) {
        basket_x = 0;
    } else if (basket_x > screen_width - basket_width) {
        basket_x = screen_width - basket_width;
    }

    yarn_y += yarn_speed;

    if (yarn_y + yarn_height > basket_y && yarn_x + yarn_width > basket_x && yarn_x < basket_x + basket_width) {
        score += 1;
        yarn_x = Math.floor(Math.random() * (screen_width - yarn_width));
        yarn_y = -yarn_height;
    }

    draw_basket(basket_x, basket_y);
    draw_yarn(yarn_x, yarn_y);
    score_display(score);

    if (yarn_y > screen_height) {
        game_over();
    }
}

function draw_basket(x, y) {
    fill(red);
    rect(x, y, basket_width, basket_height);
}

function draw_yarn(x, y) {
    fill(yellow);
    ellipse(x, y, yarn_width, yarn_height);
}

function score_display(score) {
    fill(black);
    textSize(32);
    text("Score: " + score, 10, 30);
}

function game_over() {
    fill(black);
    textSize(72);
    text("Meow :(", screen_width / 2 - 150, screen_height / 2 - 36);
    noLoop();
    setTimeout(() => {
        noLoop();
    }, 2000);
}

var catM = Object.create(spriteObject)

var image = new Image();
image.src = "cat-walking(L).GIF";
var Xspeed = 0
var Yspeed = 0
var moveLeft = false;
var moveRight = false;
var moveUp = false;
var moveDown = false;