class Game {
    constructor() {
        let base = {
            fps: 60,
            frame: 0,
            cnv: null,
            ctx: null,
            debug: false,
            paused: false,
			pauseTime: 0,
			lastFrameTime: null,
			lastGameTime: '',
            state: '',
            startTime: new Date(),  // TODO: Switch Dates to performance.now()
            screensVisible: [],
            timerFormat: '{h:}{mm:}ss.ff',
            pauseTransistioning: false,
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
		this.pauseTime = 0;
		this.lastFrameTime = null;
		this.lastGameTime = '';
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
    showPauseMenu() {
        var popup = document.getElementById('pause-popup');
        popup.classList.remove('invisible');
        popup.classList.add('visible');
    }
    hidePauseMenu() {
        var popup = document.getElementById('pause-popup');
        popup.classList.add('invisible');
        popup.classList.remove('visible');
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
            this.hide();
        } else {
           this.show();
        }
    }
    show() {
        const popup = document.getElementById('controls-popup');
        popup.classList.remove('invisible');
        popup.classList.add('visible');
        game.screensVisible.push('Options');
        game.pause(true);

    }
    hide() {
        const popup = document.getElementById('controls-popup');
        popup.classList.remove('visible');
        popup.classList.add('invisible');
        setTimeout(() => { if (popup.classList.contains('invisible')) game.screensVisible.splice(game.screensVisible.indexOf('Options'), 1); game.pause(false);}, 300);
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
                    cost: 400,
                    oneTimePurchase: true,
                    entity: {
                        name: 'Sprint',
                        isEquipped: true,
                        update: function() {
                            
                        },
                        draw: function() {
                            
                        },
                    }
                },
                {
                    name: 'Charge',
                    desc: 'Allows you to hold your attack button to charge up your next shot.  A charged shot is bigger, stronger, and can pierce through multiple enemies.',
                    cost: 600,
                    oneTimePurchase: true,
                    entity: {
                        name: 'Charge',
                        isEquipped: true,
                        update: function() {
                            
                        },
                        draw: function() {
                            
                        },
                    }
                },
                {
                    name: 'Laser Sight',
                    desc: 'Adds a laser that shows exactly where your bullets will go.',
                    cost: 600,
                    oneTimePurchase: true,
                    entity: {
                        name: 'Laser Sight',
                        isEquipped: true,
                        lastX: null,
                        lastY: null,
                        currX: null,
                        currY: null,
                        originX: null,
                        originY: null,
                        update: function() {
                            
                        },
                        draw: function(ctx) {
                            var dotSize = 4;

                            if(!game.paused) {
                                this.lastX = this.currX;
                                this.lastY = this.currY;

                                var x = game.player.x + game.map.x + game.player.width / 2;
                                var y = game.player.y + game.map.y + game.player.height / 2;
                                var targetX = game.cursor.x;
                                var targetY = game.cursor.y;
                                
                                // Limit distance of laser to range
                                let distX = targetX - x;
                                let distY = targetY - y;
                                let dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
                                let maxRange = game.player.attack.range-16;
                                if (dist > maxRange) {
                                    let pct = maxRange / dist;
                                    dist = maxRange;
                                    distX *= pct;
                                    distY *= pct;
                                    targetX = x + distX;
                                    targetY = y + distY;
                                }
                                this.originX = x;
                                this.originY = y;
                                this.currX = targetX;
                                this.currY = targetY;
                            }

                            ctx.fillStyle = 'rgba(255,0,0,0.6)';
                            ctx.strokeStyle = 'rgba(255,0,0,0.6)';
                            ctx.lineWidth = 1;
                            ctx.fillRect(this.currX - dotSize/2, this.currY - dotSize/2, dotSize, dotSize);
                            ctx.beginPath();
                            ctx.moveTo(this.originX, this.originY);
                            ctx.lineTo(this.currX, this.currY);
                            if(this.lastX !== null && this.lastY !== null && (this.lastX !== this.currX || this.lastY !== this.currY)) {
                                // Draw Laser "triangle" line swoosh
                                ctx.lineTo(this.lastX, this.lastY);
                                ctx.closePath();

                                let currMid = midPoint(this.originX, this.originY, this.currX, this.currY);
                                let changeDist = Math.sqrt(Math.pow(this.currX-this.lastX, 2) + Math.pow(this.currY-this.lastY, 2));
                                let p = getPerpOfLine(this.originX, this.originY, this.currX, this.currY);
                                var isOppositeDirection = isLeft({x: this.originX, y: this.originY}, {x: this.lastX, y: this.lastY}, {x:this.currX, y: this.currY});                            
                                if(isOppositeDirection) changeDist *= -1;

                                var my_gradient=ctx.createLinearGradient(currMid.x + (p.y * changeDist),currMid.y + (p.x * changeDist),currMid.x,currMid.y);
                                my_gradient.addColorStop(1,"rgba(255,0,0,0.5)");
                                my_gradient.addColorStop(0,"rgba(255,0,0,0.0)");
                                ctx.fillStyle=my_gradient;
                                ctx.fill();
                            } else {
                                // Draw Laser Line
                                ctx.stroke();
                            }
                        },
                    },
                },
                {
                    name: 'Test Item',
                    desc: 'pls don\'t buy, only testing.',
                    cost: 100,
                    oneTimePurchase: false,
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
        this.updateItems();
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
            if(!item.oneTimePurchase || game.player.items.filter(i => i.name === item.name).length === 0) {
                html +=
                    `
                    <div class ="item-choice" data-item="${item.name}" onclick="game.map.shop.buy(event, this);">
                        <div class ="item-choice-name">${item.name}</div>
                        <div class ="item-choice-desc">${item.desc}</div>
                        <div class ="item-choice-cost">${item.cost} gold</div>
                    </div>
                    `;
            }
        }
        document.getElementById('shop-choices').innerHTML = html;
    }

    buy(e, choice) {
        const item = this.items.find(i => i.name === choice.getAttribute('data-item'));
        if (item.cost > game.player.gold) {
            // Not enough money
        } else {
            game.player.items.push(item.entity || item);
            game.player.gold -= item.cost;
            document.getElementById('shop-gold').textContent = 'You have ' + game.player.gold + ' gold';
            this.updateItems();
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
            upgradeLevels: {
                healthUp: 0, 
                damageUp: 0,
                speedUp: 0,
                pierceUp: 0,
                fireRateUp: 0,
                rangeUp: 0,
                chargeCapacityUp: 0,
                chargeRateUp: 0,
                maxBulletsUp: 0,
                luckUp: 0,
                dashDurationUp: 0,
                dashCooldownDown: 0,
            },
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
            if(this.items.filter(i => i.name === 'Charge' && i.isEquipped).length > 0) {
                if (this.attack.charge < this.attack.chargeCapacity) {
                    this.attack.charge += this.attack.chargeRate;
                } else {
                    this.attack.charge = this.attack.chargeCapacity;
                }
            }
        } else if(this.attack.charging) {
            this.attack.charging = false;
            this.attack.firing = true;
        }

        // Player sprint ability
        if(this.items.filter(i => i.name === 'Sprint' && i.isEquipped).length > 0) {
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

    heal(hp, isOverheal) {
        let isFullyHealed = (this.hp >= this.maxHp);
        let healWillOverHeal = (this.hp + hp > this.maxHp);
        if (isOverheal || (!isFullyHealed && !healWillOverHeal)) {
            this.hp += hp;
        } else if (!isFullyHealed && healWillOverHeal) {
            this.hp = this.maxHp;
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

class Upgrades {
    constructor() {
        let base = {
            upgradeGUI: {
                upgradeCapLeft: 'res/upgradeCapLeft.png',
                upgradeUnitOn: 'res/upgradeUnitOn.png',
                upgradeUnitOff: 'res/upgradeUnitOff.png',
            },
            upgrades: {
                healthUp: {
                    name: 'Health Up',
                    iconPath: 'res/healthUpIcon.png',
                    hue: 0,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 10,     // HP to increase with each count
                    maxLevel: 30,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'healthUp');
                        if (success) {    
                            entity.maxHp += value;                         // Increase their max HP
                            entity.heal(value);
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                }, 
                damageUp: {
                    name: 'Damage Up',
                    iconPath: 'res/damageUpIcon.png',
                    hue: 0.14,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 1,     // HP to increase with each count
                    maxLevel: 30,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'damageUp');
                        if (success) {
                            entity.attack.dmg += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                }, 
                speedUp: {
                    name: 'Speed Up',
                    iconPath: 'res/speedUpIcon.png',
                    hue: 0.25,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 0.25,     // HP to increase with each count
                    maxLevel: 30,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'speedUp');
                        if (success) {
                            entity.speed += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                }, 
                pierceUp: {
                    name: 'Pierce Up',
                    iconPath: 'res/pierceUpIcon.png',
                    hue: 0.75,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 1,     // HP to increase with each count
                    maxLevel: 10,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'pierceUp');
                        if (success) {
                            entity.attack.pierce += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                },
                fireRateUp: {
                    name: 'Fire Rate Up',
                    iconPath: 'res/fireRateUpIcon.png',
                    hue: 0.14,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: -2,     // HP to increase with each count
                    maxLevel: 30,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'fireRateUp');
                        if (success) {
                            entity.attack.fireRate += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                }, 
                rangeUp: {
                    name: 'Range Up',
                    iconPath: 'res/rangeUpIcon.png',
                    hue: 0.4,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 10,     // HP to increase with each count
                    maxLevel: 40,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'rangeUp');
                        if (success) {
                            entity.attack.range += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                }, 
                chargeCapacityUp: {
                    name: 'Charge Capacity Up',
                    iconPath: 'res/chargeCapacityUpIcon.png',
                    hue: 0.17,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 1,     // HP to increase with each count
                    maxLevel: 40,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'chargeCapacityUp');
                        if (success) {
                            entity.attack.chargeCapacityUp += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return entity.items.filter(i => i.name === 'Charge').length > 0;
                    },
                }, 
                chargeRateUp: {
                    name: 'Charge Rate Up',
                    iconPath: 'res/chargeRateUpIcon.png',
                    hue: 0.22,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 0.025,     // HP to increase with each count
                    maxLevel: 40,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'chargeRateUp');
                        if (success) {
                            entity.attack.chargeRate += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return entity.items.filter(i => i.name === 'Charge').length > 0;
                    },
                }, 
                maxBulletsUp: {
                    name: 'Max Bullets Up',
                    iconPath: 'res/maxBulletsUpIcon.png',
                    hue: 0.2,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 1,     // HP to increase with each count
                    maxLevel: 30,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'maxBulletsUp');
                        if (success) {
                            entity.attack.maxBullets += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                }, 
                luckUp: {
                    name: 'Luck Up',
                    iconPath: 'res/luckUpIcon.png',
                    hue: 0.3,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 1,     // HP to increase with each count
                    maxLevel: 30,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'luckUp');
                        if (success) {
                            entity.luck += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return true;
                    },
                }, 
                dashDurationUp: {
                    name: 'Dash Duration Up',
                    iconPath: 'res/dashDurationUpIcon.png',
                    hue: 0.18,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: 2,     // HP to increase with each count
                    maxLevel: 30,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'dashDurationUp');
                        if(success) {
                            entity.sprint.duration += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return entity.items.filter(i => i.name === 'Sprint').length > 0;
                    },
                }, 
                dashCooldownDown: {
                    name: 'Dash Cooldown Down',
                    iconPath: 'res/dashCooldownDownIcon.png',
                    hue: 0.5,
                    saturation: 0,
                    brightness: 0,
                    incrementValue: -4,     // HP to increase with each count
                    maxLevel: 10,           // Max Count
                    applyUpgradeTo: entity => {
                        var { success, value } = this.baseApplyUpgradeTo(entity, 'dashCooldownDown');
                        if (success) {
                            entity.sprint.cooldown += value;
                        }
                        return success;
                    },
                    isAvailable: entity => {
                        return entity.items.filter(i => i.name === 'Sprint').length > 0;
                    },
                }, 
            },
        };
        for (let attribute in base) {
            this[attribute] = base[attribute];
        }
    }
    baseApplyUpgradeTo(entity, upgradeKey) {
        var success = false;
        var value = null;
        if(entity.upgradeLevels[upgradeKey] < this.upgrades[upgradeKey].maxLevel) {    // If player is not max level
            entity.upgradeLevels[upgradeKey]++;    // Level up player
            value = this.upgrades[upgradeKey].incrementValue;               
            success = true;
        } 
        return { success, value };
    }
    getUpgradeProgress(entity, upgradeKey) {
        return Math.min((entity.upgradeLevels[upgradeKey] / this.upgrades[upgradeKey].maxLevel), 1);
    }
    generateHtmlForUpgradeOption(upgradeKey, entity) {
        let upgrade = this.upgrades[upgradeKey];
        if(!upgrade.applyUpgradeTo) return '';
        if(!upgrade.isAvailable(entity)) return '';
        let html = `
        <div class="upgrade-choice" data-upgrade="${upgrade.name}" data-upgrade-key="${upgradeKey}" onclick="upgrade(event, '${upgradeKey}')">
            <div class="upgrade-choice-icon">
                <img src="${upgrade.iconPath}" style="width: 100%;" />
            </div>
            <div class="upgrade-choice-name">
                ${upgrade.name}
            </div>
            <div class="upgrade-progress" style="filter: hue-rotate(${upgrade.hue*360}deg);">
                <img src="res/upgradeCapLeft_2x.png" />
                <div class="upgrade-progress-container">
                    <div class="upgrade-progress-bar" style="width: ${this.getUpgradeProgress(entity, upgradeKey)*100}%;"></div>
                </div>
                <img src="res/upgradeCapRight_2x.png" />
            </div>
        </div>
        `;
        return html;
    }
    generateHtmlForUpgradeOptions(entity) {
        let html = '';
        for(let upgradeKey in this.upgrades) {
            html += this.generateHtmlForUpgradeOption(upgradeKey, entity);
        }
        return html;
    }
}

function midPoint(x1, y1, x2, y2) {
    return { x:(x1+x2)/2, y: (y1+y2)/2 };
}
function getPerpOfLine(x1,y1,x2,y2){ // the two points can not be the same
    var nx = x2 - x1;  // as vector
    var ny = y2 - y1;
    const len = Math.sqrt(nx * nx + ny * ny);  // length of line
    nx /= len;  // make one unit long
    ny /= len;  // which we call normalising a vector
    return { x: nx, y: -ny }; // return the normal  rotated 90 deg
}
function isLeft(a, b, c)
{
     return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) > 0;
}