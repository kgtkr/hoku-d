phina.globalize();

var W = 500; 
var H = 800;

//ゲームシーン
phina.define("MainScene", {
    superClass: "CanvasScene",
    init: function () {
        let self = this;

        this.superInit();
        // 背景色を指定
        this.backgroundColor = "green";
        
        //プレイヤー
        var playerCS = CircleShape();
        playerCS.radius = 15;
        this.player = playerCS.addChildTo(this);
        this.player.SPEED = 5;
        this.player.x = W / 2;
        this.player.y = H - 50;
        this.player.charge = 0;
        this.player.fill = "red";
        this.player.update = function (app) {
            var p = app.pointer;
            var vec = new Vec2(p.x - this.x, p.y - this.y);

            //移動するか
            var isMove = vec.getLenSqr() > 10 * 10;

            //正規化
            vec.unit();

            //マウスと50以上離れているなら移動
            if (isMove) {
                this.x += vec.x * 7;
                this.y += vec.y * 7;
            }


            //クリックならチャージ
            if (p.getPointing()) {
                this.charge++;
                if (this.charge > 120) {
                    this.fill = "blue";
                } else if (this.charge > 60) {
                    this.fill = "purple";
                }
            }
            //クリックしてないなら発射
            if (!p.getPointing() && this.charge !== 0) {

                //チャージが60未満
                if (this.charge <= 60) {
                    this.bNew(this.x, this.y, -Math.PI / 2);
                } else if (this.charge <= 90) {
                    this.bNewC(this.x, this.y, 5);
                } else {
                    this.bNewC(this.x, this.y, 10);
                }
                this.fill = "red";
                this.charge = 0;
            }
        }

        //敵
        this.enemy = CanvasElement().addChildTo(this);

        //弾
        this.playerB = CanvasElement().addChildTo(this);

        this.score = 0;

        this.player.bNew = function (x,y,rad) {
            var cs = CircleShape();
            cs.radius = 5;
            cs.fill = "yellow";
            var b = cs.addChildTo(self.playerB);
            b.x = x;
            b.y = y;
            b.vec = new Vec2(0, -10).setRad(rad);
            b.update = function (app) {
                if (isOut(this)) {
                    this.remove();
                }
            }
        };

        this.player.bNewC = function (x,y,num) {
            for (let i = 0; i < num; i++) {
                //ToRad
                let rad = i * (360 / num) * Math.PI / 180;
                this.bNew(x,y,rad);
            }
        }
    },

    update: function (app) {
        //敵
        if (Math.randint(0,10) === 0) {
            var cs = CircleShape();
            cs.radius = 35;
            cs.fill = "black";
            var e = cs.addChildTo(this.enemy);
            e.y = 70;
            e.x = Math.randfloat(0,W);
            var vec = new Vec2(this.player.x - e.x, this.player.y - e.y);
            vec.unit();
            var speed = Math.randfloat(3, 10);
            vec.x *= speed;
            vec.y *= speed;
            e.vec = vec;
            e.update = function (app) {
                if (isOut(this)) {
                    this.remove();
                }
            }
        }

        for(let b of this.playerB.children) {
            b.x += b.vec.x;
            b.y += b.vec.y;
        }

        for(let e of this.enemy.children) {
            e.x += e.vec.x;
            e.y += e.vec.y;

            //当たり判定
            for(let b of this.playerB.children) {
                if (e.hitTestElement(b)) {
                    this.player.bNewC(e.x, e.y, 3);
                    e.remove();

                    b.remove();
                    this.score++;

                    break;
                }
            }

            //当たり判定
            if (e.hitTestElement(this.player)) {
                this.exit('result', { score: this.score });
            }
        }
    }
});

// メイン処理
phina.main(function () {
    var app = GameApp({
        width: W,
        height: H,
        fps: 60,
        title:"ほくほくちー\nだいなそー",
   });
    app.run();
});


//Vec2
var Vec2 = function (x, y) {
    this.x = x;
    this.y = y;
}

Vec2.prototype.getLen = function () {
    return Math.sqrt(this.getLenSqr());
}

Vec2.prototype.setLen = function (len) {
    var r = this.getRad();
    this.x = Math.cos(r) * len;
    this.y = Math.sin(r) * len;
}

Vec2.prototype.getLenSqr = function () {
    return this.x * this.x + this.y * this.y;
}

Vec2.prototype.unit = function () {
    var len = this.getLen();
    if(len != 0){
        this.x /= len;
        this.y /= len;
    }
}

Vec2.prototype.getRad = function () {
    return Math.atan2(this.y, this.x);
}

Vec2.prototype.setRad = function (len) {
    l = this.getLen();
    this.x = Math.cos(len) * l;
    this.y = Math.sin(len) * l;
    return this;
}

//オブジェクトが外に出ているか
var isOut=function(o){
    return o.right < 0 || o.left > W || o.bottom < 0 || o.top > H;
}
