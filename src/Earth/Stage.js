import * as THREE from "three/build/three.module.js"
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'


let camera, scene, renderer, controls, dirLight, container, starttime = Date.now(), defaultDistanz = 4;


function createLights() {
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 0, 1);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
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
    const {width, height} = getWidthHeight();

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(4, 2, -4).normalize().multiplyScalar(defaultDistanz);
}

function createRenderer() {
    const {width, height} = getWidthHeight();
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);
}

function init(aContainer) {

    container = aContainer ?? document.body;
    scene = new THREE.Scene();
    createRenderer();
    createCamera();
    createControlls();
    createLights();
    window.addEventListener('resize', onWindowResize);
    animate()
}

function getWidthHeight() {
    if (container) {
        return container.getBoundingClientRect();
    } else {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return {width, height};
    }


}

function onWindowResize() {
    const {width, height} = getWidthHeight();

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

}

let animationStarttime, animationDuration, afterAnimationDelay = 1000, animationRunning = false, animationTarget;

/**
 *
 * @param point{THREE.Vector3}
 */
function animateToPoint(point, duration = 1000) {
    animationTarget = new THREE.Vector3().copy(point).normalize().multiplyScalar(defaultDistanz);
    animationStarttime = Date.now();
    animationDuration = duration;
    animationRunning = true;
}


function animate() {

    requestAnimationFrame(animate);
    if (!animationRunning) {
        controls.update();
    } else {
        const progress = (Date.now() - animationStarttime) / animationDuration;
        if (progress < 1) {
            camera.position.lerp(animationTarget, progress)
            camera.lookAt(controls.target);
        }
        else if (progress > 1 && animationStarttime + animationDuration + afterAnimationDelay < Date.now()){
            camera.position.copy(animationTarget)
        }
        else{
            animationRunning=false;
        }
    }
    render();

}

function render() {
    const timer = (Date.now() - starttime) * 0.0001;
    dirLight.position.x = Math.cos(timer) * controls.autoRotateSpeed;
    dirLight.position.z = Math.sin(timer) * controls.autoRotateSpeed;

    dirLight.position.normalize();


    renderer.render(scene, camera);

}

export {camera, scene, renderer, controls, init, animateToPoint};