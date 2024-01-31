let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let letters = "R O B Y _ S A A V E D R A".split(" ");
let letterObjects = [];

let clicked = false;
let spacing = 16; // Define your spacing here


class Letter {
    constructor(letter, x, y, speedX, speedY) {
        this.letter = letter;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.targetX = 0;
        this.targetY = 0;
        this.hue = Math.random() * 360; // Random hue
    }
    
    create() {
        ctx.font = "64px Inter";
       
        if (clicked) {
            ctx.fillStyle = "#fff"; // When clicked, color is white
            ctx.strokeStyle = "#02304D";
        } else {
            ctx.fillStyle = "#02304D"; // When not clicked, color is gray
            ctx.strokeStyle = "#02304D";
        }
    
        ctx.lineWidth = 1;
        ctx.strokeText(this.letter, this.x, this.y);
    
        ctx.fillText(this.letter, this.x, this.y);
    
        // Clear the shadow so it doesn't affect other elements
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if(this.x + 60 > canvas.width || this.x < 0) {
            this.speedX *= -1;
        }
        
        if(this.y > canvas.height || this.y < 0) {
            this.speedY *= -1;
        }
        
        if(clicked) {
            this.x += (this.targetX - this.x) * 0.05;
            this.y += (this.targetY - this.y) * 0.05;
            this.speedX *= 0.99;
            this.speedY *= 0.5;
        }
    }
    
    arrange(index) {
        this.targetX = canvas.width / 2 - letters.length * (56 + spacing) / 2 + index * (60 + spacing);
        this.targetY = canvas.height / 8;
    }

    randomizeSpeed() {
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 8;
    }
}

for(let i = 0; i < letters.length; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let speedX = (Math.random() - 0.5) * 2;
    let speedY = (Math.random() - 0.5) * 2;
    
    letterObjects.push(new Letter(letters[i], x, y, speedX, speedY));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for(let i = 0; i < letterObjects.length; i++) {
        letterObjects[i].create();
        letterObjects[i].update();
        if (clicked) {
            letterObjects[i].arrange(i);
        }
    }
    
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', () => {
    clicked = true;
    setTimeout(() => { 
        clicked = false; 
        for(let i = 0; i < letterObjects.length; i++) {
            letterObjects[i].randomizeSpeed();
        }
    }, 2000);
});

animate();


//---DraggableBoxes

let draggable = document.getElementById('draggable');
let dragHandle = document.getElementById('drag-handle');

dragHandle.addEventListener('mousedown', function(e) {
    draggable.style.position = 'absolute';
    let shiftX = e.clientX - draggable.getBoundingClientRect().left;
    let shiftY = e.clientY - draggable.getBoundingClientRect().top;

    draggable.style.left = e.pageX - shiftX + 'px';
    draggable.style.top = e.pageY - shiftY + 'px';

    function onMouseMove(event) {
        draggable.style.left = event.pageX - shiftX + 'px';
        draggable.style.top = event.pageY - shiftY + 'px';
    }

    // move the draggable on mousemove
    document.addEventListener('mousemove', onMouseMove);

    // drop the draggable, remove unneeded handlers
    document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
    };

});

// prevent default drag handler
dragHandle.ondragstart = function() {
    return false;
};

