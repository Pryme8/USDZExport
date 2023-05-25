// import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
// import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent 
import { TestScene } from "./testScene"

class App {    
    public scene: TestScene    
    constructor() {
        this.scene = new TestScene()
    }
}
new App()