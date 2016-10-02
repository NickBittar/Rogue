class Game {
    constructor() {
        let base = {
            fps: 60,
            frame: 0,
            cnv: null,
            ctx: null,
            debug: false,
            paused: false,
            state: '',
            startTime: new Date(),  // TODO: Switch Dates to performance.now()
            screensVisible: [],
        };
        for (var attribute in base) {
            this[attribute] = base[attribute];
        }
    }
    reset() {
        this.frame = 0;
        this.debug = false;
        this.paused = false;
        this.state = '';
        this.startTime = new Date();
    }

    pause(option) {
        if (option === undefined) {
            if (this.screensVisible.length === 0) {
                game.paused = !game.paused;
                return;
            }
        }
        if (option === true) {
            game.paused = true;
        } else if (option === false) {
            if (this.screensVisible.length === 0) {
                game.paused = false;
            }
        }

    }

}
class Controls {
    
    constructor(game) {
		let base = {
			left: 	65,	// A
			up: 	87, // W
			right: 	68,	// D
			down:   83,	// S
            use:    69, // E  
			sprint: 16,	// Shift
			shoot: 	32,	// Space
			pause:	27,	// Esc
			
		};
        for (var attribute in base) {
            this[attribute] = base[attribute];
        }
        this.game = game;
        this.listener = this.readKey.bind(this);

        this.controlsInit();
	}

    controlsInit() {
        this.updateControls();
        const inputs = document.querySelectorAll('div.control-input');
        for(let input of inputs) {
            input.addEventListener('click', this.getKey.bind(this));
        }
    }

    getKey(e) {
        const inputScreen = document.getElementById('get-input-screen');
        inputScreen.classList.remove('invisible');
        inputScreen.classList.add('visible');

        const control = e.target.id.split('-')[1];
        this.control = control;
        
        document.addEventListener('keydown', this.listener);
    }

    readKey(e) {
        document.removeEventListener('keydown', this.listener);
        switch (this.control) {
            case 'up':
                this.up = e.keyCode;
                break;
            case 'left':
                this.left = e.keyCode;
                break;
            case 'down':
                this.down = e.keyCode;
                break;
            case 'right':
                this.right = e.keyCode;
                break;
            case 'use':
                this.use = e.keyCode;
                break;
            case 'sprint':
                this.sprint = e.keyCode;
                break;
            case 'shoot':
                this.shoot = e.keyCode;
                break;
        }
        this.updateControls();
        const inputScreen = document.getElementById('get-input-screen');
        inputScreen.classList.remove('visible');
        inputScreen.classList.add('invisible');
    }


    updateControls() {
        document.getElementById('control-up').textContent = this.getDisplayKey(this.up);
        document.getElementById('control-left').textContent = this.getDisplayKey(this.left);
        document.getElementById('control-down').textContent = this.getDisplayKey(this.down);
        document.getElementById('control-right').textContent = this.getDisplayKey(this.right);
        document.getElementById('control-use').textContent = this.getDisplayKey(this.use);
        document.getElementById('control-sprint').textContent = this.getDisplayKey(this.sprint);
        document.getElementById('control-shoot').textContent = this.getDisplayKey(this.shoot);
    }
    getDisplayKey(keycode) {
        if (keycode === 9) return 'Tab';
        if (keycode === 16) return 'Shift';
        if (keycode === 17) return 'Ctrl';
        if (keycode === 18) return 'Alt';
        if (keycode === 32) return 'Space';
        return String.fromCharCode(keycode);
    }

    toggleControlsPopup() {
        const popup = document.getElementById('controls-popup');
        if (popup.classList.contains('visible')) {
            popup.classList.remove('visible');
            popup.classList.add('invisible');
            setTimeout(() => { if (popup.classList.contains('invisible')) game.screensVisible.splice(game.screensVisible.indexOf('Options'), 1); game.pause(false);}, 300);
        } else {
            popup.classList.remove('invisible');
            popup.classList.add('visible');
            game.screensVisible.push('Options');
            game.pause(true);
        }
    }
}

class Shop {
    constructor(game) {
        let base = {
            x: 300,
            y: 300,
            width: 100,
            height: 100,
            color: '#652',
            items: [
                {
                    name: 'Sprint',
                    desc: 'Gain the ability to dash quickly to get around the map and to avoid enemies.',
                    cost: 200,
                },
                {
                    name: 'Charge',
                    desc: 'Allows you to hold your attack button to charge up your next shot.  A charged shot is bigger, stronger, and can pierce through multiple enemies.',
                    cost: 300,
                },
                {
                    name: 'Test Item',
                    desc: 'pls don\'t buy, only testing.',
                    cost: 100,
                },
            ],
            
        }
        for (let attribute in base) {
            this[attribute] = base[attribute];
        }
        this.game = game;
        this.updateItems();
    }

    show() {
        this.game.screensVisible.push('Shop');
        document.getElementById('shop-popup').classList.remove('invisible');
        document.getElementById('shop-popup').classList.add('visible');
        document.getElementById('shop-gold').textContent = 'You have ' + game.player.gold + ' gold';
    }

    hide() {
        game.screensVisible.splice(game.screensVisible.indexOf('Shop'), 1);
        document.getElementById('shop-popup').classList.remove('visible');
        document.getElementById('shop-popup').classList.add('invisible');
        setTimeout(() => { if (document.getElementById('shop-popup').classList.contains('invisible')) game.screensVisible.splice(game.screensVisible.indexOf('Shop'), 1); game.pause(false); }, 500);
    }

    updateItems() {
        let html = '';
        for(let item of this.items) {
            html +=
                `
                <div class ="item-choice" data-item="${item.name}" onclick="game.map.shop.buy(event, this);">
                    <div class ="item-choice-name">${item.name}</div>
                    <div class ="item-choice-desc">${item.desc}</div>
                    <div class ="item-choice-cost">${item.cost} gold</div>
                </div>
                `;
        }
        document.getElementById('shop-choices').innerHTML = html;
    }

    buy(e, choice) {
        const item = this.items.find(i => i.name === choice.getAttribute('data-item'));
        if (item.cost > game.player.gold) {
            // Not enough money
        } else {
            game.player.items.push(item);
            game.player.gold -= item.cost;
            document.getElementById('shop-gold').textContent = 'You have ' + game.player.gold + ' gold';
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + this.game.map.x, this.y + this.game.map.y, this.width, this.height);
    }
}

class Player {
    constructor(game) {
        let base = {
            x: 5,
            y: 5,
            dx: 1,
            dy: 1,
            speed: 3,
            prevX: [5, 5, 5, 5, 5],
            prevY: [5, 5, 5, 5, 5],
            width: 16,
            height: 16,
            color: '#e91e63',
            controls: {
                left: false,
                up: false,
                right: false,
                down: false,
                use: false,
                sprint: false,
                attack: false,

            },
            sprint: {
                duration: 15,
                recover: 40,
                cooldown: 40,
                status: 'ready',	// ready sprint waiting
                lastSprint: 0,
                speed: 5,
                recoverSpeed: 0.25,
            },
            attack: {
                bullets: [],
                range: 200,
                lastAttack: 0,
                fireRate: 15,
                dmg: 1,
                pierce: 1,
                maxBullets: 3,
                chargeStart: 0,
                charge: 0,
                charging: false,
                firing: false,
                chargeCapacity: 3,
                chargeRate: 0.025,
            },
            hp: 100,
            dead: false,
            maxHp: 100,
            xp: 0,
            level: 0,
            nextLevelUp: 10,
            gold: 0,
            kills: 0,
            luck: 1,
            items: [],
        };
        for (let attribute in base) {
            this[attribute] = base[attribute];
        }
        this.game = game;
    }
    update() {
        // Save previous positions
        for (let i = this.prevX.length - 1; i > 0; i--) {
            this.prevX[i] = this.prevX[i - 1];
            this.prevY[i] = this.prevY[i - 1];
        }
        this.prevX[0] = this.x;
        this.prevY[0] = this.y;

        // Get movement direction (dx & dy [-1...1])
        if ((this.controls.left && this.controls.right) || (!this.controls.left && !this.controls.right))
            this.dx = 0;
        else if (this.controls.left) this.dx = -1;
        else if (this.controls.right) this.dx = 1;
        if ((this.controls.up && this.controls.down) || (!this.controls.up && !this.controls.down))
            this.dy = 0;
        else if (this.controls.up) this.dy = -1;
        else if (this.controls.down) this.dy = 1;

        // Get normalized player movement vector
        if (this.dx != 0 && this.dy != 0) {
            this.dx *= Math.sqrt(0.5);
            this.dy *= Math.sqrt(0.5);
        }

        // Player attack
        if (this.controls.attack) {
            this.attack.charging = true;
            this.attack.firing = false;
            if (this.attack.charge < this.attack.chargeCapacity) {
                this.attack.charge += this.attack.chargeRate;
            } else {
                this.attack.charge = this.attack.chargeCapacity;
            }
        } else if(this.attack.charging) {
            this.attack.charging = false;
            this.attack.firing = true;
        }

        // Player sprint ability
        if (this.sprint.status != 'ready' && game.frame > this.sprint.lastSprint + this.sprint.duration + this.sprint.recover + this.sprint.cooldown) {
            this.sprint.status = 'ready';
        }
        if (this.controls.sprint && this.sprint.status == 'ready' &&
          (this.controls.left || this.controls.up || this.controls.right || this.controls.down)) {
            this.sprint.status = 'sprinting';
            this.sprint.lastSprint = game.frame;
        }
        if (this.sprint.status != 'ready') {
            if (game.frame < this.sprint.lastSprint + this.sprint.duration) {
                this.dx *= this.sprint.speed;
                this.dy *= this.sprint.speed;
            } else if (game.frame < this.sprint.lastSprint + this.sprint.duration + this.sprint.recover) {
                this.sprint.status = 'recovering';
                this.dx *= this.sprint.recoverSpeed;
                this.dy *= this.sprint.recoverSpeed;
                
            } else {
                this.sprint.status = 'waiting';
            }
        }

        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Stop player from getting out of bounds
        if (this.x + this.width > this.game.map.width) {
            this.x = this.game.map.width - this.width;
        }
        if (this.x < 0) this.x = 0;
        if (this.y + this.height > this.game.map.height) {
            this.y = this.game.map.height - this.height;
        }
        if (this.y < 0) this.y = 0;

        checkMapObjectCollisions(this);
    }

    upgrade(choice) {
        switch (choice) {
            case 'Health Up':
                this.hp += 10;
                this.maxHp += 10;
                break;
            case 'Damage Up':
                this.attack.dmg += 1;
                break;
            case 'Speed Up':
                this.speed += 0.25;
                break;
            case 'Pierce Up':
                this.attack.pierce += 1;
                break;
            case 'Fire Rate Up':
                this.attack.fireRate -= 2;
                break;
            case 'Range Up':
                this.attack.range += 10;
                break;
            case 'Charge Capacity Up':
                this.attack.chargeCapacity += 1;
                break;
            case 'Charge Rate Up':
                this.attack.chargeRate += 0.025;
                break;
            case 'Max Bullets Up':
                this.attack.maxBullets += 1;
                break;
            case 'Luck Up':
                this.luck += 1;
                break;
            case 'Dash Duration Up':
                this.sprint.duration += 2;
                break;
            case 'Dash Cooldown Down':
                this.sprint.cooldown -= 4;
                break;
            default:
                console.warn('Unknown upgrade ' + choice);
                break;
        }
    }
}

class Bullet {
    constructor(game, charge) {
        let base = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            speed: 12,
            prevX: new Array(8),
            prevY: new Array(8),
            width: 4,
            height: 4,
            color: '#795548',
            targetX: 0,
            targetY: 0,
            hp: 1,
            dmg: 1,
            pierce: 1,
        };
        for (let attribute in base) {
            this[attribute] = base[attribute];
        }

        this.game = game;

        this.hp = game.player.attack.pierce * (Math.floor(charge) + 1);
        this.dmg = game.player.attack.dmg * (charge + 1);
        this.width *= (charge + 1);
        this.height *= (charge + 1);

        this.x = game.player.x + game.player.width / 2 - this.width/2;
        this.y = game.player.y + game.player.height / 2 - this.height/2;
        this.targetX = game.cursor.x - game.map.x - this.width/2;
        this.targetY = game.cursor.y - game.map.y - this.height/2;
        let distX = this.targetX - this.x;
        let distY = this.targetY - this.y;
        let dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
        if (dist > game.player.attack.range) {
            let pct = game.player.attack.range / dist;
            dist = game.player.attack.range;
            distX *= pct;
            distY *= pct;
            this.targetX = this.x + distX;
            this.targetY = this.y + distY;
        }
        this.dx = distX / dist * this.speed;
        this.dy = distY / dist * this.speed;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

}

class Map {
    constructor(game) {
        let base = {
            x: 0,
            y: 0,
            width: 900,
            height: 800,
            objects: [
                { x: 150, y: 150, width: 100, height: 100 },
                { x: 150, y: 550, width: 100, height: 100 },
                { x: 650, y: 150, width: 100, height: 100 },
                { x: 650, y: 550, width: 100, height: 100 },
            ],
            enemies: [],
            maxEnemies: 10,

        };
        for (let attribute in base) {
            this[attribute] = base[attribute];
        }
        this.game = game;
        this.shop = new Shop(game);
    }
    update() {
        // Set map/camera offsets
        this.x += this.game.player.prevX[0] - this.game.player.x;
        this.y += this.game.player.prevY[0] - this.game.player.y;

        // Set limit for map/camera offset
        if (this.width < this.game.cnv.width) {
            this.x = 0;
        } else {
            if (-this.x < 0 || this.game.player.x < this.game.cnv.width / 2) {
                this.x = 0;
            }
            if (-this.x > this.width - this.game.cnv.width || this.game.player.x > this.width - this.game.cnv.width / 2) {
                this.x = -(this.width - this.game.cnv.width);
            }
        }
        if (this.height < this.game.cnv.height) {
            this.y = 0;
        } else {
            if (-this.y < 0 || this.game.player.y < this.game.cnv.height / 2) {
                this.y = 0;
            }
            if (-this.y > this.height - this.game.cnv.height || this.game.player.y > this.height - this.game.cnv.height / 2) {
                this.y = -(this.height - this.game.cnv.height);
            }
        }
    }
}

class Enemy {
    constructor(game) {
        let base = {
            x: 0,
            y: 0,
            width: 20,
            height: 20,
            speed: 4,
            color: '#34a',
            xp: 10,
            gold: 2,
            hp: 1,

        };
        for (let attribute in base) {
            this[attribute] = base[attribute];
        }
        this.game = game;
        //Spawn location
        let side = this.game.frame % 4;	//0:left 1:top 2:right 3:bottom
        switch (side) {
            case 0:
                this.x = Math.random() * 100 - 200;
                this.y = Math.random() * (this.game.map.height + 200) - 100;
                break;
            case 1:
                this.x = Math.random() * (this.game.map.width + 200) - 100;
                this.y = Math.random() * 100 - 200;
                break;
            case 2:
                this.x = Math.random() * 100 + 100 + this.game.map.width;
                this.y = Math.random() * (this.game.map.height + 200) - 100;
                break;
            case 3:
                this.x = Math.random() * (this.game.map.width + 200) - 100;
                this.y = Math.random() * 100 + 100 + this.game.map.height;
                break;
        }
    }
    update() {
        let distX = (this.game.player.x - this.x);
        let distY = (this.game.player.y - this.y);
        let dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
        this.x += distX / dist * (0.5 + Math.random() * 4);
        this.y += distY / dist * (0.5 + Math.random() * 4);
        checkMapObjectCollisions(this);
    }
}

class Cursor {
    constructor() {
        let base = {
            x: 0,
            y: 0,
            buttons: 0,
        };
        for (let attribute in base) {
            this[attribute] = base[attribute];
        }
    }
}