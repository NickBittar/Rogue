function controllerCheck() {
    let div = document.getElementById('controller-info');
    if ('getGamepads' in navigator) {
        let gamepads = navigator.getGamepads();
        let html = '';
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] == undefined) continue;
            html += 'Controller ' + gamepads[i].id + '<br>';
            if ('axes' in gamepads[i]) {
                for (let j = 0; j < gamepads[i].axes.length; j++) {
                    html += 'Axis ' + j + ': ' + gamepads[i].axes[j] + '<br>';
                }
            }
            if ('buttons' in gamepads[i]) {
                for (let j = 0; j < gamepads[i].buttons.length; j++) {
                    html += 'Button ' + j + ': ' + gamepads[i].buttons[j].pressed + '<br>';
                }
            }
        }
        div.innerHTML = html;
    }
}

var game = new Game();
var player;
var map;
var upgrades = new Upgrades();
init();

function levelUp() {
    const choices = document.getElementById('level-up-choices');

    choices.innerHTML = upgrades.generateHtmlForUpgradeOptions(player);

    document.getElementById('level-up-popup').classList.remove('invisible');
    document.getElementById('level-up-popup').classList.add('visible');
}

function upgrade(e, upgradeKey) {
    console.log(upgradeKey);
    
    const upgradeSuccess = upgrades.upgrades[upgradeKey].applyUpgradeTo(player);

    if(upgradeSuccess) {
        const choices = document.querySelectorAll('.upgrade-choice');
        for(let c of choices) {
            c.onclick = null;
        }

        document.getElementById('level-up-popup').classList.remove('visible');
        document.getElementById('level-up-popup').classList.add('invisible');
        setTimeout(function () { game.screensVisible.splice(game.screensVisible.indexOf('Upgrades'), 1); game.pause(false); }, 500);
    }
}

function init() {
    game.cnv = document.getElementById('cnv');
    game.ctx = game.cnv.getContext('2d');
    game.fps = 60;
	game.controls = new Controls(game);
    game.player = new Player();
    game.map = new Map();
    game.cursor = new Cursor();
    reset();

    setInterval(loop, 1000 / game.fps);
    
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
}
function reset() {
    game.reset();
    game.player = new Player(game);
    game.map = new Map(game);
    player = game.player;
    map = game.map;

    document.getElementById('game-over-screen').classList.remove('visible');
    document.getElementById('game-over-screen').classList.add('invisible');
    document.getElementById('game-over-popup').classList.remove('visible');
    document.getElementById('game-over-popup').classList.add('invisible');
}
function keyDownHandler(e) {
    e.preventDefault();
    switch (e.keyCode) {
        case game.controls.left:
            player.controls.left = true;
            break;
        case game.controls.up:
            player.controls.up = true;
            break;
        case game.controls.right:
            player.controls.right = true;
            break;
        case game.controls.down:
            player.controls.down = true;
            break;
        case game.controls.use:
            player.controls.use = true;
            break;
        case game.controls.sprint:
            player.controls.sprint = true;
            break;
        case game.controls.shoot:
            player.controls.attack = true;
            break;
        case 27:	// Esc
            if(!game.pauseTransistioning && game.screensVisible.filter(s => s !== 'Pause').length === 0) {
                if (game.paused) {
                    game.hidePauseMenu(); 
                    game.pauseTransistioning = true;
                    setTimeout(function() { game.screensVisible.splice(game.screensVisible.indexOf('Pause'), 1); game.pause(false); game.pauseTransistioning = false; }, 500);
                } else {
                    game.pause(true);
                    game.screensVisible.push('Pause');
                    game.showPauseMenu();
                }
            }
            
            break;
        case 192:	// ~
            game.debug = !game.debug;
            break;
        default:
            console.debug(e.keyCode);
            break;
    }
}
function keyUpHandler(e) {
    switch (e.keyCode) {
        case game.controls.left:
            game.player.controls.left = false;
            break;
        case game.controls.up:
            game.player.controls.up = false;
            break;
        case game.controls.right:
            game.player.controls.right = false;
            break;
        case game.controls.down:
            game.player.controls.down = false;
            break;
        case game.controls.use:
            player.controls.use = false;
            break;
        case game.controls.sprint:
            game.player.controls.sprint = false;
            break;
        case game.controls.shoot:
            game.player.controls.attack = false;
            break;
    }
}
function mouseMoveHandler(e) {
    game.cursor.x = e.x - game.cnv.offsetLeft;
    game.cursor.y = e.y - game.cnv.offsetTop;
    game.cursor.buttons = e.buttons;
}
function loop() {
    let start = performance.now();
	
	frameAdvance();
	
    if (performance.now() - start > 16) 
        console.log(performance.now() - start);
}
function frameAdvance() {
	if (game.lastFrameTime !== null && (!game.paused && game.state !== 'Game Over')) {
		game.pauseTime += (+new Date()-(+game.lastFrameTime));
		game.lastFrameTime = null;
	}
	if(game.lastFrameTime === null && (game.paused || game.state === 'Game Over')) {
		game.lastFrameTime = new Date();
	}
	
    tick();
    draw();
    
	if (!game.paused) {
		game.frame++;
	} 
}
function tick() {
	if(!game.paused) {
		// Add bullets
		if (game.player.attack.firing && player.attack.bullets.length < player.attack.maxBullets && game.frame > player.attack.lastAttack + player.attack.fireRate) {
			player.attack.bullets.push(new Bullet(game, game.player.attack.charge));
			player.attack.lastAttack = game.frame;
			game.player.attack.firing = false;
			game.player.attack.charge = 0;
		}
		// Bullet updates
		for (let i = 0; i < player.attack.bullets.length; i++) {
			player.attack.bullets[i].update();
			if (player.attack.bullets[i].x > player.attack.bullets[i].targetX - player.attack.bullets[i].speed &&
				player.attack.bullets[i].x < player.attack.bullets[i].targetX + player.attack.bullets[i].speed &&
				player.attack.bullets[i].y > player.attack.bullets[i].targetY - player.attack.bullets[i].speed &&
				player.attack.bullets[i].y < player.attack.bullets[i].targetY + player.attack.bullets[i].speed) {
				player.attack.bullets.splice(i, 1);
			}
		}

		// Check enemy collision
		let bulletsToRemove = [];
		let enemiesToRemove = [];
		for (let i in player.attack.bullets) {
			for (let j in map.enemies) {
				if (checkIntersection(player.attack.bullets[i], map.enemies[j])) {
					if (!enemiesToRemove.includes(j) && !bulletsToRemove.includes(i)) {
						player.attack.bullets[i].hp -= 1;
						map.enemies[j].hp -= player.attack.bullets[i].dmg;

						if (player.attack.bullets[i].hp <= 0) {
							bulletsToRemove.push(i);
						}
						if(map.enemies[j].hp <= 0) {
							enemiesToRemove.push(j);
							player.xp += map.enemies[j].xp;
							player.gold += map.enemies[j].gold + Math.floor(Math.random() * map.enemies[j].gold * 3);
							player.kills++;
							break;
						}
					}
				}
			}
		}
		// Remove bullets that collided
		for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
			player.attack.bullets.splice(bulletsToRemove[i], 1);
		}
		// Remove enemies that were shot
		for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
			map.enemies.splice(enemiesToRemove[i], 1);
		}

		// Check if player is hit
		if (!game.debug && game.frame % (10 + player.luck) === 0) {
			for(let enemy of map.enemies) {
				if (checkIntersection(enemy, player)) {
					if (player.hp > 0) {
						player.hp -= 5;
					} else {
						player.dead = true;
						player.controls.left = player.controls.up = player.controls.right = player.controls.down = false;
						if (game.state != 'Game Over') {
							game.state = 'Game Over';
							setTimeout(() => {
								document.getElementById('game-over-screen').classList.remove('invisible');
								document.getElementById('game-over-screen').classList.add('visible');
							}, 800);
							setTimeout(() => {
								document.getElementById('game-over-popup').classList.remove('invisible');
								document.getElementById('game-over-popup').classList.add('visible');
								game.pause(false);
							}, 2200);
						}
					}
				}
			}
		}
    



		// Enemies
		if (map.enemies.length < map.maxEnemies) {
			map.enemies.push(new Enemy(game));
		}
		for (let enemy of map.enemies) {
			enemy.update();
		}

		// Advance player movement
		if (!player.dead) {
			player.update();
			map.update();
		}

		// Player Level Up
		if (player.xp >= player.nextLevelUp) {
			game.screensVisible.push('Upgrades');
			game.pause(true);
			player.level++;
			player.nextLevelUp += 100;
			setTimeout(levelUp, 300);
		}

		// Player shop
		if (player.controls.use && checkIntersection(player, map.shop)) {
			map.shop.show();
			game.pause(true);
		}
		
		game.lastGameTime = (new Date() - game.startTime);
	} else {
		// Game is paused...
	}
}
function checkMapObjectCollisions(entity) {
    let speedX = (entity.dx * entity.speed) || entity.speed;
    for (let i = 0; i < map.objects.length; i++) {
        let obj = map.objects[i];
        if (checkIntersection(entity, obj)) {
            if (entity.x + entity.width - obj.x <= Math.abs(speedX) + 0.01 || entity.x - obj.x - obj.width >= -(Math.abs(speedX) + 0.01)) {
                if (entity.x + entity.width / 2 < obj.x + obj.width / 2) {
                    entity.x = obj.x - entity.width;
                } else {
                    entity.x = obj.x + obj.width;
                }
            }
            else {
                if (entity.y + entity.height / 2 < obj.y + obj.height / 2) {
                    entity.y = obj.y - entity.height;
                } else {
                    entity.y = obj.y + obj.height;
                }
            }
        }
    }
}

function draw() {
    //requestAnimationFrame(draw);
    game.ctx.clearRect(0, 0, game.cnv.width, game.cnv.height);

    // Draw Map
    game.ctx.fillStyle = '#f3f3f3';
    game.ctx.fillRect(map.x, map.y, map.width, map.height);

    // Draw map background
    game.map.shop.draw(game.ctx);

    if (game.debug) {
        game.ctx.strokeStyle = '#e8e8e8';
        game.ctx.fillStyle = '#f0f0f0';
        game.ctx.beginPath();
        game.ctx.arc(player.x + map.x + player.width / 2, player.y + map.y + player.height / 2, player.attack.range - 16, 0, 2 * Math.PI);
        game.ctx.fill();
        game.ctx.stroke();
        game.ctx.strokeStyle = '#e8e8e8';
        game.ctx.fillStyle = '#e5e5e5';
        game.ctx.beginPath();
        game.ctx.arc(player.x + map.x + player.width / 2, player.y + map.y + player.height / 2, player.attack.range / 6, 0, 2 * Math.PI);
        game.ctx.fill();
        game.ctx.stroke();
    }

    if (player.sprint.status == 'sprinting' || player.sprint.status == 'recovering') {
        game.ctx.fillStyle = '#eee';
        game.ctx.fillRect(player.prevX[6] + map.x, player.prevY[6] + map.y, player.width, player.height);
        game.ctx.fillStyle = '#ddd';
        game.ctx.fillRect(player.prevX[4] + map.x, player.prevY[4] + map.y, player.width, player.height);
        game.ctx.fillStyle = '#ccc';
        game.ctx.fillRect(player.prevX[2] + map.x, player.prevY[2] + map.y, player.width, player.height);
        game.ctx.fillStyle = '#bbb';
        game.ctx.fillRect(player.prevX[1] + map.x, player.prevY[1] + map.y, player.width, player.height);
        game.ctx.fillStyle = '#aaa';
        game.ctx.fillRect(player.prevX[0] + map.x, player.prevY[0] + map.y, player.width, player.height);

        game.ctx.strokeStyle = '#333';
        game.ctx.lineWidth = 4;
        game.ctx.strokeRect(player.x + map.x, player.y + map.y, player.width, player.height);
    }

    if (player.attack.charge === player.attack.chargeCapacity) {
        game.ctx.strokeStyle = '#ee2';
        game.ctx.lineWidth = 8;
        game.ctx.strokeRect(player.x + map.x, player.y + map.y, player.width, player.height);
    }


    game.ctx.fillStyle = player.color;
    game.ctx.fillRect(player.x + map.x, player.y + map.y, player.width, player.height);

    for (let i = 0; i < player.attack.bullets.length; i++) {
        game.ctx.fillStyle = player.attack.bullets[i].color;
        game.ctx.fillRect(player.attack.bullets[i].x + map.x, player.attack.bullets[i].y + map.y, player.attack.bullets[i].width, player.attack.bullets[i].height);
    }

    for (let i = 0; i < map.enemies.length; i++) {
        game.ctx.fillStyle = map.enemies[i].color;
        game.ctx.fillRect(map.enemies[i].x + map.x, map.enemies[i].y + map.y, map.enemies[i].width, map.enemies[i].height);
        game.ctx.fillText(i, map.enemies[i].x + map.x, map.enemies[i].y + map.y)
    }

    // Draw items
    for(var u of player.items) {
        if(u.draw && u.isEquipped) {
            u.draw(game.ctx);
        }
    }

    // Draw map objects
    game.ctx.fillStyle = '#222';
    map.objects.forEach(obj => game.ctx.fillRect(obj.x + map.x, obj.y + map.y, obj.width, obj.height));


    if (game.debug) {
        game.ctx.fillStyle = '#289';
        game.ctx.font = "16px Helvetica";
        let lineHeight = 20;
        let line = 1;
        game.ctx.fillText('Frame: ' + game.frame, 10, lineHeight * line++);
        game.ctx.fillText('player.x: ' + player.x.toFixed(2), 10, lineHeight * line++);
        game.ctx.fillText('player.y: ' + player.y.toFixed(2), 10, lineHeight * line++);
        game.ctx.fillText('player.r: ' + (player.x + player.width).toFixed(2), 10, lineHeight * line++);
        game.ctx.fillText('player.b: ' + (player.y + player.height).toFixed(2), 10, lineHeight * line++);
        game.ctx.fillText('map.x: ' + map.x.toFixed(2), 10, lineHeight * line++);
        game.ctx.fillText('map.y: ' + map.y.toFixed(2), 10, lineHeight * line++);
        game.ctx.fillText('attack.charge: ' + player.attack.charge.toFixed(2), 10, lineHeight * line++);
    }

    // HUD
    game.ctx.lineWidth = 2;
    game.ctx.strokeStyle = '#eee';
    game.ctx.strokeRect(650, 110, 100, 10);
    game.ctx.fillStyle = '#111';
    game.ctx.fillRect(650, 110, 100, 10);
    game.ctx.fillStyle = '#b23';
    game.ctx.fillRect(650, 110, 100* (player.hp / player.maxHp), 10);

    game.ctx.font = "700 24px Helvetica";
    game.ctx.strokeText(player.hp + '/' + player.maxHp, 650, 150);
    game.ctx.fillText(player.hp + '/' + player.maxHp, 650, 150);
    game.ctx.fillStyle = '#111';
    game.ctx.fillText(player.xp + ' XP', 650, 70);

    game.ctx.lineWidth = 1;
    game.ctx.strokeStyle = '#eee';
    game.ctx.strokeText(player.xp + ' XP', 650, 70);

    game.ctx.fillText('Level ' + player.level, 650, 180);
    game.ctx.strokeText('Level ' + player.level, 650, 180);

    game.ctx.strokeStyle = '#222';
    game.ctx.fillStyle = '#ffeb3b';
    game.ctx.fillText(player.gold + ' gold', 650, 40);
    game.ctx.strokeText(player.gold + ' gold', 650, 40);

    game.ctx.strokeStyle = '#eee';
    game.ctx.fillStyle = '#111';
    game.ctx.fillText(player.kills + ' kills', 650, 100);
    game.ctx.strokeText(player.kills + ' kills', 650, 100);

    game.ctx.font = "900 36px Helvetica";
    game.ctx.strokeStyle = '#222';
    game.ctx.fillStyle = '#eee';
    let elapsed = new Date(game.lastGameTime - game.pauseTime);
	let time = formatTime(elapsed, game.timerFormat);
    game.ctx.fillText(time, game.cnv.width / 2 - game.ctx.measureText(time).width/2, 50);
    game.ctx.strokeText(time, game.cnv.width / 2 - game.ctx.measureText(time).width / 2, 50);

}

function formatTime(datetime, format = 'h:mm:ss.fff') {
	if(datetime === null || datetime === undefined) return format.replace(/[A-z]/g, '0');
	duration = +datetime;
	
	const datetimeParts = {
		hh: '',
		h: '',
		mm: '',
		m: '',
		ss: '',
		s: '',
		fff: '',
		ff: '',
		f: '',
	};
	
	// MILLISECOND
	let ms = duration % 1000;
	if (/s/g.test(format)) {	// If we are adding an sec component, shift extra milliseconds to seconds
		ms %= 1000;
	}
	duration -= ms;
	
	datetimeParts.fff = Math.floor(ms/  1).toString().padStart(3, '0');
	datetimeParts.ff  = Math.floor(ms/ 10).toString().padStart(2, '0');
    datetimeParts.f   = Math.floor(ms/100).toString().padStart(1, '0');
	
	// SECOND
	let sec = (duration / 1000);
	if (/m/g.test(format)) {	// If we are adding an min component, shift extra seconds to minutes
		sec %= 60;
	}
	duration -= sec*1000;
	
	datetimeParts.s = sec.toString();
	datetimeParts.ss = sec.toString().padStart(2, '0');
	
	// MINUTE
	let min = (duration / 1000 / 60);
	if (/h/g.test(format)) {	// If we are adding an hour component, shift extra minutes to hours
		min %= 60;
	}
	duration -= min*1000*60;
	
	datetimeParts.m = min.toString();
	datetimeParts.mm = min.toString().padStart(2, '0');
	
	// HOUR
	let hr = (duration / 1000 / 60 / 60);
	duration -= hr*1000*60*60;
	hr = hr.toString();
	
	datetimeParts.h = hr.toString();
	datetimeParts.hh = hr.toString().padStart(2, '0');
	
	for(var dp in datetimeParts) {
		var regexToFindOptionalPart = new RegExp('{' + dp + '(.?)}', 'g');
		if(regexToFindOptionalPart.test(format) && (datetimeParts[dp] === '' || datetimeParts[dp] == 0)) {
			format = format.replace(regexToFindOptionalPart, '');
		} else {
			format = format.replace(dp, datetimeParts[dp]);
		}
		
	}
    format = format.replace(/{|}/g, '');    // Remove curly braces "{", "}"
	
	return format;
}

function checkIntersection(r1, r2) {
    return r1.x + r1.width > r2.x &&
            r1.x < r2.x + r2.width &&
            r1.y + r1.height > r2.y &&
            r1.y < r2.y + r2.height;
}