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

const createCity = (data)=>{
    const loader = new GLTFLoader();
    const city = new Group();
    scene.add(city);
    city.position.y=1;
    // const yAngle= city.position.angleTo(new Vector3(0,1,0));
    city.lookAt(new Vector3(0,0,0));

    // const yQuat= new Quaternion();
    // yQuat.setFromAxisAngle(new Vector3(0,0,1),-yAngle);
    // const zAngle = city.position.angleTo(new Vector3(0,0,1));
    // const zQuat= new Quaternion();
    // zQuat.setFromAxisAngle(new Vector3(1,0,0),-zAngle);
    // city.quaternion.multiply(zQuat).multiply(yQuat);
    city.add(new Mesh(new SphereBufferGeometry(0.01),new MeshStandardMaterial({color:0xff0000})));
    loader.load('models/city/scene.gltf',(model)=>{
        const innercity=model.scene;
        const posWrapper=new Group();
        posWrapper.add(innercity);
        city.add(posWrapper);
        innercity.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),-Math.PI/2));
        innercity.updateMatrix(true);
        posWrapper.updateMatrix(true);
        const box = new Box3().setFromObject(posWrapper);
        const scale= new Vector3();
        box.getSize(scale);
        posWrapper.scale.multiplyScalar(0.1/Math.max(Math.max(scale.x,scale.y),scale.z));
        posWrapper.updateMatrixWorld(true);
        const smallbox = box.applyMatrix4(posWrapper.matrix);
        const size= new Vector3();
        const center = new Vector3();
        box.getSize(size);
        box.getCenter(center)
        center.y=0;
        posWrapper.position.sub(center).add(new Vector3(0,0,0));

        console.log(posWrapper);
    })
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
    getNextCityData((cities) => {
        console.log(cities);
        createCity(cities[0]);
        // setTimeout(() => getNextCityData(json2 => console.log(json2)), 1000);
    });


}

export {
    init
};