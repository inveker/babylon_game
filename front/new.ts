import {
    Animation,
    ArcRotateCamera, Color3, CubeTexture,
    Engine, FreeCamera,
    HemisphericLight, KeyboardEventTypes, Mesh,
    MeshBuilder,
    Ray, RayHelper,
    Scene, StandardMaterial, Texture,
    TransformNode,
    Vector3
} from "@babylonjs/core";
import "@babylonjs/inspector";
import Game from "./Game";
import {initInputs} from '../common/inputs';
import {addOnMsg, getInitMsg, initMsg, ws} from "./connection";

let input = initInputs();

const GRAVITY = 1;


const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const engine = new Engine(canvas);
const scene = new Scene(engine);




let game = new Game(<HTMLCanvasElement>document.getElementById('canvas'));
game.addModel('char', 'Plane', './', 'char.babylon');
game.addModel('planet', 'Sphere', './', 'earth.babylon');
game.run(function ({canvas, engine, scene, getModel}) {

    let gamers = {};
    let player: TransformNode;
    let anims = {};

    createHero(getInitMsg().user);

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

    function drawChar(char): TransformNode {
        const hero = new TransformNode('hero', scene);
        let model = getModel('char');
        model.parent = hero;
        model.rotation.y = Math.PI;
        let p = char.position;
        hero.position = new Vector3(p.x, p.y, p.z);
        gamers[char.id] = hero;
        return hero;
    }

    function createHero(char) {
        player = drawChar(char);

        player['id'] = char.id;
        const arcCamera = new ArcRotateCamera('camera', -Math.PI / 2, 1, 200, Vector3.Zero(), scene);
        arcCamera.upperBetaLimit = Math.PI * 8 / 18;
        arcCamera.lowerBetaLimit = -arcCamera.lowerBetaLimit;
        arcCamera.lowerRadiusLimit = 60;
        arcCamera.parent = player;
        arcCamera.attachControl(canvas, true);

        // Skybox
        var skybox = MeshBuilder.CreateBox("skyBox", {size:6000}, scene);
        var skyboxMaterial: StandardMaterial;
        skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        var files = [
            "skybox/space_left.jpg",
            "skybox/space_up.jpg",
            "skybox/space_front.jpg",
            "skybox/space_right.jpg",
            "skybox/space_down.jpg",
            "skybox/space_back.jpg",
        ];
        skyboxMaterial.reflectionTexture = CubeTexture.CreateFromImages(files, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;

        const light = new HemisphericLight("light", new Vector3(0, 1020, 0), scene);

        const planet = getModel('planet');
        planet.position = new Vector3(0,0,0);
        // planet.scaling = new Vector3(50,50,50)

        scene.debugLayer.show();

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


    function localAxes(size) {
        var pilot_local_axisX = Mesh.CreateLines("pilot_local_axisX", [
            Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
            new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
        ], scene);
        pilot_local_axisX.color = new Color3(1, 0, 0);

        let pilot_local_axisY = Mesh.CreateLines("pilot_local_axisY", [
            Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
            new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
        ], scene);
        pilot_local_axisY.color = new Color3(0, 1, 0);

        var pilot_local_axisZ = Mesh.CreateLines("pilot_local_axisZ", [
            Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
            new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
        ], scene);
        pilot_local_axisZ.color = new Color3(0, 0, 1);

        var local_origin = MeshBuilder.CreateBox("local_origin", { size: 1 }, scene);
        local_origin.isVisible = false;

        pilot_local_axisX.parent = local_origin;
        pilot_local_axisY.parent = local_origin;
        pilot_local_axisZ.parent = local_origin;

        return local_origin;

    }

    engine.runRenderLoop(function() {
        scene.render();
    });
})


function vecToLocal(mesh: Mesh | TransformNode, vector){
    var m = mesh.getWorldMatrix();
    var v = Vector3.TransformCoordinates(vector, m);
    return v;
}