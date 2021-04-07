import * as STAGE from "./Stage"
import {SphereBufferGeometry, Mesh, MeshStandardMaterial, TextureLoader} from "three/build/three.module.js";

let scene;


const createEarth = () => {
    const loader = new TextureLoader();
    const m = new Mesh(
        new SphereBufferGeometry(1, 20, 20),
        new MeshStandardMaterial(
            {
                map: loader.load("textures/8081_earthmap2k.jpg"),
                bumpMap: loader.load("textures/8081_earthbump2k.jpg"),
                aoMap:loader.load("textures/8081_earthspec2k.jpg")
            })
    );
    scene.add(m);
}

const init = () => {
    STAGE.init();
    scene = STAGE.scene;
    window.STAGE = STAGE;
    createEarth();

}

export {
    init
};