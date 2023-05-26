
import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3} from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { USDZExport } from "../exporter/exporter";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/loaders/glTF"
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

export class TestScene {
  public static Instance: TestScene;
  private _target: HTMLElement;
  private _canvas: HTMLCanvasElement;
  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }
  private _engine: Engine;
  public get engine(): Engine {
    return this._engine;
  }
  private _scene: Scene;
  public get scene(): Scene {
    return this._scene;
  }
  public static get Scene(): Scene {
    return TestScene.Instance.scene;
  }

  public static Delta: number = 0;

  constructor() {
    TestScene.Instance = this;
    this._target = document.getElementById("game");
    this._canvas = this._createCanvas();
    this._initializeEngine();
    this.scene.onBeforeRenderObservable.add(() => {
      TestScene.Delta = this.engine.getDeltaTime() * 0.001;
    });
  }

  private _createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    this._target.appendChild(canvas);
    return canvas;
  }

  private _initializeEngine() {
    const engine = new Engine(this.canvas, true);
    const scene = new Scene(engine);
    globalThis.scene = scene;

    const camera = new FreeCamera("camera1", new Vector3(0, 0, -22), scene);
    camera.setTarget(Vector3.Zero());

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const divFps = document.getElementById("fps");

    // var sphere = MeshBuilder.CreateSphere(
    //   "sphere",
    //   { diameter: 2, segments: 32 },
    //   scene
    // );
    // sphere.position.y = 1;
    // const sphereMat = new StandardMaterial("sphereMat", scene);
    // sphereMat.diffuseColor = new Color3(0.58, 0.23, 0.59);
    // sphere.material = sphereMat;
    // var ground = MeshBuilder.CreateGround(
    //   "ground",
    //   { width: 6, height: 6 },
    //   scene
    // );

    // scene.onAfterRenderObservable.addOnce(() => {
   
    // });

    SceneLoader.ImportMesh("", "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", "DamagedHelmet.gltf", scene, (newMeshes)=>{
      USDZExport.Export(scene, {}).then((data) => {
        const downloadButton = document.createElement("a");   
        downloadButton.href = URL.createObjectURL( new Blob( [ data ], { type: 'application/octet-stream' } ));
        document.body.appendChild(downloadButton);
        downloadButton.click()
        document.body.removeChild(downloadButton);
      })
    });

    engine.runRenderLoop(() => {
      scene.render();
      divFps.innerHTML = engine.getFps().toFixed() + " fps";
    });

    this._target.addEventListener("resize", () => {
      engine.resize();
    });
    window.addEventListener("resize", () => {
      engine.resize();
    });

    this._engine = engine;
    this._scene = scene;
  }
}


