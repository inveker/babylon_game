import * as WebSocket from 'ws';
import Game from '../front/Game';
import {
    Mesh,
    NullEngine,
    Ray,
    TransformNode,
    Vector3,
    Scene,
    AssetsManager,
    ArcRotateCamera,
    AbstractMesh, PickingInfo
} from '@babylonjs/core';

global.XMLHttpRequest = require('xhr2').XMLHttpRequest;

const GRAVITY = 1;

// const engine = new NullEngine();
// const scene = new Scene(engine);
// const assetsManager = new AssetsManager(scene);
//
// const meshTask = assetsManager.addMeshTask("planet task", "Sphere", "http://0.0.0.0:8080/", "earth.babylon");
// meshTask.onSuccess = function(task) {
//     console.log(task);
// }
// meshTask.onError = function (task, message, exception) {
//     console.log(message, exception);
// }
//
// assetsManager.load();
// assetsManager.onFinish = function(tasks) {
//     var camera = new ArcRotateCamera("Camera", 0, 0.8, 100, Vector3.Zero(), scene);
//     engine.runRenderLoop(function() {
//         scene.render();
//     });
// };


global.XMLHttpRequest = require('xhr2').XMLHttpRequest;


let game = new Game(null);

game.addModel('char', 'Plane', 'http://0.0.0.0:8080/', 'char.babylon');
game.addModel('planet', 'Sphere', 'http://0.0.0.0:8080/', 'earth.babylon');
game.run(function ({canvas, engine, scene, getModel}) {

    function addChar(): AbstractMesh {
        const hero = new AbstractMesh('hero', scene);
        const char = getModel('char');
        char.parent = hero
        char.rotation.y = Math.PI;
        char.isPickable = false
        hero.position = new Vector3(0,530,0)
        return hero;
    }

    const planet = getModel('planet');
    planet.position = new Vector3(0,0,0);
    planet.updateFacetData();

    const planetNormals = planet.getFacetLocalNormals();
    // planet.scaling = new Vector3(50,50,50)



    const wss = new WebSocket.Server({ port: 8077 })


    let users = {};
    let chars = {};

    let ID = 0;


    wss.on('connection', ws => {
        let id = ID++;

        ws['id'] = id;
        ws['status'] = 'new';


        let char = chars[id] = addChar();

        users[id] = {
            id: id,
            position: {
                x: char.position.x,//Math.random() * 5,
                y: char.position.y,
                z: char.position.z//Math.random() * 5,
            },
            rotation: {
                x: char.rotation.x,
                y: char.rotation.y,
                z: char.rotation.z,
            },
            rotationY: char.rotation.y,
            lastNormal: new Vector3(0,1,0),
            rotationQuaternion: {
                x: 0,
                y: 0,
                z: 0,
                w:0
            },
            speed: 5,
            eatSpeed: 10,
            color: {r: Math.random(), g: Math.random(), b: Math.random(),},
            mass: 100,
        }
        let user = users[id];



        ws.on('message', message => {
            let t = Date.now();
            let msg = (<string>message).split('');

            switch (msg[0]) {
                case '1':
                    if(char) {
                        let _ws = +msg[1] == 2 ? -1 : +msg[1];
                        let _ad = +msg[3] == 2 ? -1 : +msg[3];

                        user.rotationY -= _ad * Math.PI / 18;
                        char.addRotation(0, _ad * Math.PI / 18, 0);
                        char.locallyTranslate(new Vector3(0,0,_ws * 5));



                        //GRAVITY
                        const toCenterPlanet = planet.position.subtract(char.position);

                        // console.log(toCenterPlanet.length())
                        const ray = new Ray(char.position, toCenterPlanet, 1)

                        // RayHelper.CreateAndShow(ray, scene, new Color3(1, 0, 0));
                        const res: PickingInfo = scene.pickWithRay(ray, mesh => mesh == planet, true);

                        if(res.pickedPoint) {
                            const toGround = res.pickedPoint.subtract(char.position);
                            const dHeight = toGround.length() - GRAVITY;
// console.log(res.pickedPoint,toGround)
                            if(dHeight > GRAVITY) {
                                char.locallyTranslate(Vector3.Down().scale(GRAVITY));
                            } else {
                                char.position = res.pickedPoint
                            }
                        }

                        // const index = planet.getClosestFacetAtCoordinates(char.position.x, char.position.y, char.position.z);
                        // if(index > -1) {
                        //     const facetNormal = planet.getFacetNormal(index).normalize();
                        //     if(facetNormal) {
                        //         console.log(facetNormal)
                        //         var direction = new Vector3(Math.cos(user.rotationY), 0, Math.sin(user.rotationY));
                        //
                        //         var right = Vector3.Cross(facetNormal, direction).normalize();
                        //         direction = Vector3.Cross(right, facetNormal).normalize();
                        //         var up = Vector3.Cross(direction, right).normalize();
                        //
                        //         var curRot = Vector3.RotationFromAxis(right, up, direction);
                        //
                        //         // console.log(direction, right, up, curRot)
                        //
                        //         char.rotation.copyFrom(curRot);
                        //     }
                        // }
                        // console.log('index', index);




                        //
                        // //Rotation
                        // const headPoint = vecToLocal(char, new Vector3(0, 10, 6));
                        // const tailPoint = vecToLocal(char, new Vector3(0, 10, -18));
                        // const leftPoint = vecToLocal(char, new Vector3(-7, 10, 0));
                        // const rightPoint = vecToLocal(char, new Vector3(7, 10, 0));
                        //
                        // console.log('3 time: ', Date.now() - t);
                        //
                        //
                        // // MeshBuilder.CreateSphere("1", { diameter: 1 }, scene).position = headPoint;
                        // // MeshBuilder.CreateSphere("1", { diameter: 1 }, scene).position = tailPoint;
                        // // MeshBuilder.CreateSphere("1", { diameter: 1 }, scene).position = leftPoint;
                        // // MeshBuilder.CreateSphere("1", { diameter: 1 }, scene).position = rightPoint;
                        //
                        // const headToCenterPlanet = planet.position.subtract(headPoint);
                        // const tailToCenterPlanet = planet.position.subtract(tailPoint);
                        // const leftToCenterPlanet = planet.position.subtract(leftPoint);
                        // const rightToCenterPlanet = planet.position.subtract(rightPoint);
                        //
                        // console.log('4 time: ', Date.now() - t);
                        //
                        //
                        // const headRay = new Ray(headPoint, headToCenterPlanet, 1);
                        // const tailRay = new Ray(tailPoint, tailToCenterPlanet, 1)
                        // const leftRay = new Ray(leftPoint, leftToCenterPlanet, 1)
                        // const rightRay = new Ray(rightPoint, rightToCenterPlanet, 1)
                        //
                        // console.log('5 time: ', Date.now() - t);
                        //
                        //
                        // // RayHelper.CreateAndShow(tailRay, scene, new Color3(1, 0, 0));
                        //
                        //
                        // const headRes = scene.pickWithRay(headRay, mesh => mesh == planet, true);
                        //
                        // const tailRes = scene.pickWithRay(tailRay, mesh => mesh == planet, true);
                        // const leftRes = scene.pickWithRay(leftRay, mesh => mesh == planet, true);
                        // const rightRes = scene.pickWithRay(rightRay, mesh => mesh == planet, true);
                        //
                        // console.log('6 time: ', Date.now() - t);
                        //
                        //
                        //
                        // if(headRes.pickedPoint && tailRes.pickedPoint && leftRes.pickedPoint && rightRes.pickedPoint) {
                        //     const sagittal = headRes.pickedPoint.subtract(tailRes.pickedPoint);
                        //     const frontal = rightRes.pickedPoint.subtract(leftRes.pickedPoint);
                        //     const normal = sagittal.cross(frontal);
                        //
                        //     char.rotation = Vector3.RotationFromAxis(frontal, normal, sagittal);
                        // }
                        //
                        // console.log('7 time: ', Date.now() - t);



                        user.position = {
                            x: char.position.x,
                            y: char.position.y,
                            z: char.position.z,
                        }

                        user.rotation = {
                            x: char.rotation.x,
                            y: char.rotation.y,
                            z: char.rotation.z,
                        }

                        console.log('8 time: ', Date.now() - t);


                    }
                    break;
                case '2':
                    delete users[id];
                    break;
            }
            console.log('e time: ', Date.now() - t);
        });

    });
    const encoder = new TextEncoder()
    let t = Date.now();

    setInterval(function () {
        // console.log(Date.now() - t, process.memoryUsage().rss / 1024 / 1024)
        // t = Date.now();


        let d = encoder.encode(JSON.stringify({
            users:users
        }));


        wss.clients.forEach(function(client) {
            // console.log(client.status)
            if(client['status'] == 'new') {
                client['status'] = 'update';
                client.send( encoder.encode(JSON.stringify({
                    type: 'new',
                    id: client['id'],
                    user: users[client['id']]
                })));
            } else {
                client.send(d);
            }

        });
        // console.log(Date.now() - t)

    }, 100);

});


function vecToLocal(mesh: Mesh | TransformNode, vector){
    var m = mesh.getWorldMatrix();
    var v = Vector3.TransformCoordinates(vector, m);
    return v;
}