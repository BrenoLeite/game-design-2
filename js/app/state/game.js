define(['app/config', 
        'app/environment',
        'app/HUD',
        'app/player', 
        'app/action', 
        'app/mobFactory',
        'app/controls',
        'app/platform'], 
function(config, environment, HUD, player, action, mobFactory, controls, platform) {
    "use strict"

    var count = 0;

    var game = function(game) {
        this.game = game;
    };

    game.prototype = {
        preload: function() {
            this.game.load.image('ground', 'assets/images/ground-temp.jpg');
            this.game.load.image('nuke_bg', 'assets/images/nuke.jpg');
            this.game.load.audio('impact', 'assets/audio/SoundEffects/bullet-hit.wav');
            this.game.load.image('background1', 'assets/images/bgtest.jpg');
            this.game.load.image('background2', 'assets/images/bgtest3.jpg');
            this.game.load.image('health', 'assets/images/gradient.png');
            this.game.load.spritesheet('player', 'assets/images/player-sprite-wire.png', 400, 400);
            this.game.load.image('bullet', 'assets/images/bullet-temp.png');
            this.game.load.spritesheet('mob', 'assets/images/player-badguy-temp.png', 40, 40);

        },
        create: function() {
            environment.build(this.game);
            player.build(this.game);
            HUD.build(this.game, player);
            action.init(this.game);
            controls.bind(this.game, action, environment, player);
        },

        update: function() {

            var game = this.game;
            var fx = this.game.add.audio('impact');
            fx.addMarker('impact-segment', 0, .5);
            var playerObject = player.player;
	   
            var bullets = player.bullets;
            var mobObjects = mobFactory.getAliveMobs();
            
            environment.filter.update();
            
            // Jump cheking
            if(playerObject.body.velocity.y >= 0 && playerObject.body.velocity.y <= 20){
                count += 1;
                if(count > 10)
                    player.setJumping(false);
            }else{
                player.setJumping(true);
                count = 0;
            }	    
            game.physics.arcade.collide(playerObject, platform.platformGroup,
		function (playerr, platformm){
		    // trying to fix collision, but it does not work because of tween is being use to move platforms
		    player.player.body.velocity.x = 0;
		    platformm.body.velocity.x = 0;
		    // && (player.player.body.y + player.player.height) > platformm.body.y
		    if(!platformm.is.ground){		
			environment.ableMove = false;
		    }
	    });

	    // Homing Missile
	    if(HUD.k1){
		HUD.missile.rotation = this.game.physics.arcade.moveToPointer(HUD.missile, 1000, this.game.input.activePointer, 500)
		game.physics.arcade.collide(HUD.missile, platform.platformGroup,
		   function(missile, plat) {
		       missile.kill();
		       HUD.k1 = false;
                   });
	    }
            
            //nuke
            if(HUD.k3){
                mobObjects.forEach(function(obj) {
                    obj.hurt(1000);
                });
            }
	    
            mobObjects.forEach(function(obj) {
                obj.mob.healthGraphic.x = obj.mob.body.x + 30;
                obj.mob.healthGraphic.y = obj.mob.body.y;
                game.physics.arcade.collide(obj.mob, platform.platformGroup);
                game.physics.arcade.overlap(player.bullets, obj.mob,
                    // TODO for some reason these are backwards ?
                    function(bullet, mob) {
                        mob.kill();
                        fx.play('impact-segment');
                        obj.hurt(50);
                        HUD.score(50);
                    }
                );
		game.physics.arcade.collide(HUD.missile, obj.mob,
		   function(missile, mob) {
		       missile.kill();
		       HUD.k1 = false;
		       obj.hurt(700);
                   });
                game.physics.arcade.overlap(obj.mob, player.player,
                    function(player, mob) {
                        console.log('test');
                    }
                );
                /* Mobs shooting
                 *  Is he able to shoot
                 */
                obj.faceCheck(player);
                var ray = new Phaser.Line(obj.mob.body.x, obj.mob.body.y,playerObject.body.x, playerObject.body.y)

                if(!platform.getIntersection(ray,game))
                    obj.shoot(playerObject.body.x, playerObject.body.y)
                else
                    obj.rest();

                var mobBullets = obj.bullets;
                game.physics.arcade.collide(mobBullets, platform.platformGroup,
                    function(bullet, platform) {
                        bullet.kill();
                    }
                );

                game.physics.arcade.overlap(mobBullets, playerObject,
                    // backwars either
                    function(bullet, player) {
                        player.kill();
                        fx.play('impact-segment');
                        HUD.hurt(40);
                    }
                );
            });

            game.physics.arcade.collide(bullets, platform.platformGroup,
                function(bullet, platform) {
                    bullet.kill();
                }
            );

            config.game.level[game.currentLevel].spawnpoints.forEach(function(spawnpoint) {
                if (Math.abs(environment.backdrop.x) < spawnpoint)
                {
                    if (mobFactory.canspawn)
                    {
                        var mobs = mobFactory.build(game, 5);
                        mobFactory.canspawn = false;
                        environment.stopWorld();
                    }
                    else if (mobFactory.getAliveMobs().length == 0
                        && playerObject.body.x < config.game.width / 2)
                    {
                        config.game.level[game.currentLevel].spawnpoints.shift();
                        mobFactory.canspawn = true;
                        environment.startWorld(playerObject, environment,
                            platform);
                    }
                }
            });

            controls.check(game);
        }
    }

    return game;

});
