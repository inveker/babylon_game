import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Matrix,
    Animation,
    Color3,
    FreeCamera,
    HemisphericLight, KeyboardEventTypes, Mesh, MeshBuilder,
    StandardMaterial, Texture,
    Vector3, CannonJSPlugin, OimoJSPlugin
} from "@babylonjs/core";
import Game from "./Game";
import {initInputs} from '../common/inputs';
import {addOnMsg, getInitMsg, initMsg, ws} from "./connection";

let input = initInputs();
let localInput = {};

let game = new Game(<HTMLCanvasElement>document.getElementById('canvas'));
game.addModel('char', 'Plane', './', 'char1.babylon');
game.addModel('flower', 'Cylinder', './', 'flower1.babylon');
game.addModel('earth', 'Sphere', './', 'earth.babylon');
game.run(function ({canvas, engine, scene, getModel}) {
    let gamers = {};
    let player: Mesh;


    //Lights
    const light = new HemisphericLight("light", new Vector3(0, 50, 0), scene);

    // const flower = getModel('flower');
    const earth = getModel('earth');
    earth.scaling = new Vector3(10,10,10)

    //Materials


    var matGround = new StandardMaterial("myMaterial", scene);
    let groundTexture = new Texture("ground3.jpg", scene);
    groundTexture.uScale = 10.0;
    groundTexture.vScale = 10.0;
    matGround.diffuseTexture = groundTexture;

    let speed = 0;
    let eatSpeed = 0;
    let posY = 0;
    let rotYbase = Math.PI * 0.05;
    let rotY = 0;
    let anims = {};
    let camera;

    // console.log(initMsg)
    createHero({

    });
    const encoder = new TextEncoder()

    addOnMsg(function (data) {
        drawChars(data);
        ws.send([1, ...Object.values(input)].join(''));
    });

    function drawChars(data) {
        let chars = data.users;

        for(let id in gamers) {
            let gamer = gamers[id];
            let char = chars[id];
            //update
            if(char) {
                if(anims[id]) {
                    gamer.animations = [];
                    anims[id].stop();
                    delete anims[id];
                }
                const xSlide = new Animation ("xSlide", "position", 60, Animation.ANIMATIONTYPE_VECTOR3);
                let keyFrames = [];
                keyFrames.push({
                    frame: 0,
                    value: gamer.position,
                });
                keyFrames.push({
                    frame: 6,
                    value: new Vector3(char.position.x, char.position.y, char.position.z),
                });
                xSlide.setKeys(keyFrames);
                gamer.animations.push(xSlide);

                const xSlide2 = new Animation ("xSlide2", "rotation", 60, Animation.ANIMATIONTYPE_VECTOR3);
                let keyFrames2 = [];
                keyFrames2.push({
                    frame: 0,
                    value: gamer.rotation,
                });
                keyFrames2.push({
                    frame: 6,
                    value: new Vector3(char.rotation.x, char.rotation.y, char.rotation.z)
                });
                xSlide2.setKeys(keyFrames2);
                gamer.animations.push(xSlide2);

                anims[id] = scene.beginAnimation(gamer, 0, 6, false);

                //remove
            } else {
                gamer.dispose();
            }
            delete chars[id];
        }
        //new
        for(let id in chars) {
            let char = chars[id];
            let hero = drawChar(char);
        }
    }



    function drawChar(char):Mesh {
        let hero = new Mesh('hero', scene);

        let model = getModel('char');
        // let mat1 = new StandardMaterial('mat1', scene);
        // // console.log(char.color.r, char.color.g, char.color.b)
        // mat1.diffuseColor = new Color3(char.color.r, char.color.g, char.color.b);
        // mat1.specularColor = Color3.Black();
        // model.material = mat1;
        model.parent = hero;
        model.rotation.y = Math.PI / 2;
        // model.scaling = new Vector3(30,30,30);
        let p = char.position;
        hero.position = new Vector3(p.x, p.y, p.z);

        gamers[char.id] = hero;

        return hero;
    }

    function createHero(char) {
        player = drawChar(char);
        player['id'] = char.id;
        let c =  new FreeCamera("FollowCam", new Vector3(0,0,0), scene);
        c.rotation.y = Math.PI / 2;
        c.rotation.x = Math.PI / 180 * 25;
        camera = MeshBuilder.CreateSphere('heroEye', {diameter: 1}, scene);

        camera.parent = player;
        camera.position = new Vector3(70, 30, 0)
        camera.rotation.y = Math.PI;


        let c_x = canvas.width / 2;
        let c_y = canvas.height / 2;

        // player.setPivotMatrix(Matrix.Translation(player.position.x - 0, player.position.y - 0, player.position.z - 0));


        c.parent = camera;

        // let ground = MeshBuilder.CreateGround('ground', {width: 16000, height: 16000}, scene);
        // let planet = MeshBuilder.CreateSphere('planet', {diameter: 400}, scene);
        // ground.material = matGround;

        scene.debugLayer.show();

        // let vector = { x:'', y:'', z:'' };
        // scene.onPointerDown = function (event, pickResult){
        //     //left mouse click
        //     if(event.button == 0){
        //         vector = pickResult.pickedPoint;
        //         let a = MeshBuilder.CreateSphere('1', {diameter: 5}, scene);
        //         a.position = new Vector3(+vector.x, +vector.y,  +vector.z)
        //         // console.log(pickResult)
        //         // console.log('left mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z );
        //     }
        //     //right mouse click
        //     if(event.button == 2){
        //         vector.x = pickResult.pickedPoint.x;
        //         vector.y = pickResult.pickedPoint.y;
        //         vector.z = pickResult.pickedPoint.z;
        //         // console.log('right mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z );
        //     }
        //
        // }



        scene.onKeyboardObservable.add((kbInfo) => {

            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    if(kbInfo.event.code == 'KeyW') {
                        input._ws = 1;
                    } else if(kbInfo.event.code == 'KeyS') {
                        input._ws = 2;
                    } else if(kbInfo.event.code == 'KeyA') {
                        input._ad = 2;
                    } else if(kbInfo.event.code == 'KeyD') {
                        input._ad = 1;
                    } else if(kbInfo.event.code == 'ShiftLeft') {
                        input._shift = 1;
                    } else if(kbInfo.event.code == 'KeyE') {
                        input._eq = 2;
                    } else if(kbInfo.event.code == 'KeyQ') {
                        input._eq = 1;
                    } else if(kbInfo.event.code == 'Space') {
                        input._space = 1;
                        setTimeout(function () {
                            input._space = 0;
                        }, 300);
                    }

                    break;
                case KeyboardEventTypes.KEYUP:
                    // console.log("KEY UP: ", kbInfo.event.code);
                    if(kbInfo.event.code == 'KeyW') {
                        if(input._ws == 1)
                            input._ws = 0;
                    } else if(kbInfo.event.code == 'KeyS') {
                        if(input._ws == 2)
                            input._ws = 0;
                    } else if(kbInfo.event.code == 'KeyA') {
                        if(input._ad == 2)
                            input._ad = 0;
                    } else if(kbInfo.event.code == 'KeyD') {
                        if(input._ad == 1)
                            input._ad = 0;
                    } else if(kbInfo.event.code == 'ShiftLeft') {
                        if(input._shift == 1)
                            input._shift = 0;
                    } else if(kbInfo.event.code == 'KeyE') {
                        if(input._eq == 2)
                            input._eq = 0;
                    } else if(kbInfo.event.code == 'KeyQ') {
                        if(input._eq == 1)
                            input._eq = 0;
                    }

                    break;
            }
        });


        engine.runRenderLoop(function() {
            scene.render();
        });
    }
});



