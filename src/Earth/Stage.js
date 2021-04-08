import * as THREE from "three/build/three.module.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'



let camera, scene, renderer, controls, dirLight;


function createLights() {
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 0, 1);
    scene.add(dirLight);

}

function createControlls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // optional


    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controls.autoRotate = true;

    // controls.maxPolarAngle = Math.PI / 2;
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 5);
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff,1);
    document.body.appendChild(renderer.domElement);
}

function init() {

    scene = new THREE.Scene();
    createRenderer();
    createCamera();
    createControlls();
    createLights();
    window.addEventListener('resize', onWindowResize);
    animate()
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

    requestAnimationFrame(animate);
    controls.update();
    render();

}

function render() {
    const timer = Date.now() * 0.0001;

    dirLight.position.x = Math.cos( timer ) * controls.autoRotateSpeed;
    dirLight.position.z = Math.sin( timer ) *controls.autoRotateSpeed;

    dirLight.position.normalize();


    renderer.render(scene, camera);

}

export {camera, scene, renderer, controls, init};