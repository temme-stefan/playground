import * as STAGE from "./Stage"
import {
    SphereBufferGeometry,
    Mesh,
    MeshStandardMaterial,
    TextureLoader,
    Box3,
    Vector3, Group, Quaternion
} from "three/build/three.module.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

let scene;


const createEarth = () => {
    const loader = new TextureLoader();
    const m = new Mesh(
        new SphereBufferGeometry(1, 20, 20),
        new MeshStandardMaterial(
            {
                map: loader.load("textures/8081_earthmap2k.jpg"),
                bumpMap: loader.load("textures/8081_earthbump2k.jpg"),
                aoMap: loader.load("textures/8081_earthspec2k.jpg")
            })
    );
    scene.add(m);
}

let endCursor="";

const getNextCityData = (callback) => {
    const data = getCityQuery();

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("x-rapidapi-host", "geodb-cities-graphql.p.rapidapi.com");
    headers.append("X-RapidAPI-Key", "a49681c145msh05bd1c9a0c47bbcp16da0ejsn7d77dff0025d");

    fetch("https://geodb-cities-graphql.p.rapidapi.com/", {
        "method": "POST",
        "mode": "cors",
        headers,
        "body": data
    }).then(response => response.json())
        .then(json => {
            endCursor=json.data.populatedPlaces.pageInfo.endCursor
            const cities = json.data.populatedPlaces.edges.map(e=>e.node);
            callback(cities);
        })
        .catch(err => {
            console.error(err);
        });
}

let loadedModel;
const  addInnerCity = ( city,size)=> {
    city.add(new Mesh(new SphereBufferGeometry(0.0005*size),new MeshStandardMaterial({color:0xff0000})));
    return;
    if (loadedModel){
        city.add(loadedModel.clone());
    }
    const loader = new GLTFLoader();
    loader.load('models/city/scene.gltf', (model) => {
        const innercity = model.scene;
        const posWrapper = new Group();
        posWrapper.add(innercity);
        loadedModel=posWrapper;
        city.add(loadedModel);
        innercity.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
        innercity.updateMatrix(true);
        posWrapper.updateMatrix(true);
        const setColor = (o => o.material?.color.setHex(0xff0000));
        innercity.traverse(setColor);
        const box = new Box3().setFromObject(innercity);
        const scale = new Vector3();
        box.getSize(scale);
        posWrapper.scale.multiplyScalar(0.001 / Math.max(Math.max(scale.x, scale.y), scale.z));
        posWrapper.updateMatrixWorld(true);
        const smallbox = box.applyMatrix4(posWrapper.matrix);
        const size = new Vector3();
        const center = new Vector3();
        box.getSize(size);
        posWrapper.position.add(new Vector3(-size.z / 2, size.x / 2, 0));

    })
}

const createCity = (data)=>{
    const city = new Group();
    scene.add(city);
    const radius=1;

    const polar= (90 -data.latitude )/180*Math.PI;
    const azimuthal = (-data.longitude+90)/180*Math.PI;

    const xR = radius * Math.sin(polar) * Math.cos(azimuthal)
    const yR = radius * Math.sin(polar) * Math.sin(azimuthal)
    const zR = radius * Math.cos(polar)

    const xL = yR;
    const yL = zR;
    const zL = -xR;
    city.position.set(xL,yL,zL);
    addInnerCity( city,data.population/1e6);
}

const getCityQuery = () => {
    const data = JSON.stringify({
        "query": "query{\n  populatedPlaces(\n    types:[\"CITY\"]\n    sort:\"-population\"\n    first:10\n" + (endCursor !== "" ? "after:\"" + endCursor + "\"\n" : "") + "  ){\n    totalCount\n    pageInfo{\n      startCursor\n      endCursor\n      hasNextPage\n      hasPreviousPage\n    }\n        edges {\n          node {\n            name\n            population\n            latitude\n            longitude\n          }\n        }\n  }\n}"
    });
    return data;
}
const init = () => {
    STAGE.init();
    scene = STAGE.scene;
    window.STAGE = STAGE;
    createEarth();
    let steps=10;
    const step = ()=>{
        getNextCityData((cities) => {
            console.log(cities);
            cities.forEach(c=>createCity(c));
            if (--steps>0) {
                setTimeout(() => step(), 1000);
            }
        });
    }
    step();



}

export {
    init
};