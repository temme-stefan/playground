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
                aoMap: loader.load("textures/8081_earthspec2k.jpg")
            })
    );
    scene.add(m);
}



const getCityQuery= (endCursor="") => {
    let data;
    if (endCursor=="") {
        data = JSON.stringify({
            "query": "query{\n  populatedPlaces(\n    types:[\"CITY\"]\n    sort:\"-population\"\n    first:10\n  ){\n    totalCount\n    pageInfo{\n      startCursor\n      endCursor\n      hasNextPage\n      hasPreviousPage\n    }\n        edges {\n          node {\n            name\n            population\n            latitude\n            longitude\n          }\n        }\n  }\n}"
        });
    }
    else{
        data = JSON.stringify({
            "query": "query{\n  populatedPlaces(\n    types:[\"CITY\"]\n    sort:\"-population\"\n    first:10\n"+(endCursor!=""?"after:\""+endCursor+"\"\n":"")+"  ){\n    totalCount\n    pageInfo{\n      startCursor\n      endCursor\n      hasNextPage\n      hasPreviousPage\n    }\n        edges {\n          node {\n            name\n            population\n            latitude\n            longitude\n          }\n        }\n  }\n}"
        });
    }
    return data;
}

const createCitys = (callback,endCursor = "") => {
    const data = getCityQuery(endCursor);

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            callback(JSON.parse(this.responseText));
        }
    });

    xhr.open("POST", "https://geodb-cities-graphql.p.rapidapi.com/");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("x-rapidapi-key", "a49681c145msh05bd1c9a0c47bbcp16da0ejsn7d77dff0025d");
    xhr.setRequestHeader("x-rapidapi-host", "geodb-cities-graphql.p.rapidapi.com");

    xhr.send(data);
}

const init = () => {
    STAGE.init();
    scene = STAGE.scene;
    window.STAGE = STAGE;
    createEarth();
    createCitys((json)=>{
        console.log(json);
        setTimeout(()=>createCitys(json2=>console.log(json2),json.data.populatedPlaces.pageInfo.endCursor),1000);
    });


}

export {
    init
};