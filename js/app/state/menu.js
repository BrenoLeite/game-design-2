define(['app/config'],
function(config) {
    "use strict"

    var menu = function(game) {
        this.game = game;
    };

    menu.prototype = {
        preload: function() {
            this.game.load.image('logo', 'assets/images/logo_crop_500.png');
            this.game.load.script('filter', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Fire.js');
            this.game.load.image('button1', 'assets/images/hotkey1.png');
            this.game.load.image('button2', 'assets/images/Hotkey2.png');
            this.game.load.image('button3', 'assets/images/Hotkey3.png');
            this.game.load.image('healthUI', 'assets/images/PCAhZzQ.png');
            this.game.load.audio('sfx', 'assets/audio/SoundEffects/LikeABoss.mp3');        
            //https://www.youtube.com/watch?v=i57YfVVYILU remember to give credit
            //he put this up for everyone to use
            this.game.load.audio('BGmusic', 'assets/audio/SoundEffects/likeabossinstrumentalremix3.mp3');
        },
        create: function() {
            var bgm = this.game.add.audio('BGmusic');
            bgm.play('',0,1,true);
            this.game.add.sprite(config.game.width / 2 - 500 / 2,
                config.game.height / 2 - 350, 'logo');
            var background = this.game.add.sprite(0, 0);
            background.width = config.game.width;
            background.height = config.game.height;

            this.filter = this.game.add.filter('Fire', config.game.width, config.game.height);
            this.filter.alpha = 0.0;

            background.filters = [this.filter];

            var text = "Start Game";
            var style = { font: "65px Arial", fill: "#ffffff", align: "center", cursor: "pointer"};
            var t = this.game.add.text(this.game.world.centerX - 170, this.game.world.centerY + 150, text, style);
            t.inputEnabled = true;
            var fx = this.game.add.audio('sfx');
            t.events.onInputUp.add(function() {
                bgm.stop();
                fx.play('', 0,1);
                this.game.state.start('game');
            }, this);
        },
        update: function() {
            this.filter.update();
        }
    }

    return menu;

});
