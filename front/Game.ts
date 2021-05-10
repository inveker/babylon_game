import {Engine, NullEngine, Scene, SceneLoader} from "@babylonjs/core";

interface Model {
    name: string,
    model: string,
    path: string,
    file: string
}

class Game {
    protected models = [];
    canvas: HTMLCanvasElement;
    scene: Scene;
    engine: Engine;

    constructor(canvas: HTMLCanvasElement | null) {
        this.canvas = canvas;
        this.engine = canvas ? new Engine(canvas) : new NullEngine();
        this.scene = new Scene(this.engine);
    }



    addModel(name: string, model: string, path: string, file: string) {
        this.models.push({name, model, path, file});
    }

    async loadModels(): Promise<CallableFunction> {
        let res = {};
        let loads = {};
        let models = this.models;
        // console.log(models);
        for(let i = 0; i < models.length; i++) {
            let {name, model, path, file} = models[i];

            if(!loads[path+file])
                loads[path+file] = {models: {}, container: await SceneLoader.LoadAssetContainerAsync(path, file, this.scene)};

            loads[path+file].models[model+path+file] = name;
        }
        for(let key in loads) {
            loads[key].container.getNodes().forEach(node => {
                let name = loads[key].models[node.name+key];
                if(name)
                    res[name] = node;
            });
        }
        return function (name) {
            return res[name].clone(name);
        };
    }

    async run(rules: CallableFunction) {
        let getModel = await this.loadModels();
        rules({canvas: this.canvas, engine: this.engine, scene: this.scene, getModel: getModel});
    }
}
export default Game;