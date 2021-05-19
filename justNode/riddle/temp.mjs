import {permutations, nthCombinationVector, random} from "./Maths.mjs";

const parts = [
    "gbwr",
    "bgwr",
    "brgw",
    "rwbg",
    "wrgb",
    "rwbg",
    "rwbg",
    "wbrg",
    "wgbr",
];

const rot = (s) => Array.from(s, (_, i) => Array.from(s, (__, j) => s[(i + j) % s.length]).join(''));

const partsWithAllRots = parts.map(rot);

const isValid = (a) => a[0][1] == a[1][3]
    && a[1][1] == a[2][3]
    && a[3][1] == a[4][3]
    && a[4][1] == a[5][3]
    && a[6][1] == a[7][3]
    && a[7][1] == a[8][3]
    && a[0][2] == a[3][0]
    && a[3][2] == a[6][0]
    && a[1][2] == a[4][0]
    && a[4][2] == a[7][0]
    && a[2][2] == a[5][0]
    && a[5][2] == a[8][0];

const rotV = Array.from(parts, _ => 4);
const perms = permutations(Array.from({length: parts.length}, (_, i) => i));

const maxRot = rotV.reduce((a, b) => a * b);
const maxPerm = perms.length;


let result = null;

while (result == null) {
    const seed = [random(maxRot), random(maxPerm)];
    const rotation = nthCombinationVector(rotV, seed[0]);
    const permutation = perms[seed[1]];
    const test = permutation.map((x, i) => partsWithAllRots[x][rotation[i]]);
    if (isValid(test)) {
        result = {
            seed,
            test,
            permutation,
            rotation
        };
        break;
    }
}


const getString = (t)=> {
    const row = (i) => {
        return `+-------+-------+-------+
|   ${t[3 * i + 0][0]}   |   ${t[3 * i + 1][0]}   |   ${t[3 * i + 2][0]}   | 
| ${t[3 * i + 0][3]}   ${t[3 * i + 0][1]} | ${t[3 * i + 1][3]}   ${t[3 * i + 1][1]} | ${t[3 * i + 2][3]}   ${t[3 * i + 2][1]} |
|   ${t[3 * i + 0][2]}   |   ${t[3 * i + 1][2]}   |   ${t[3 * i + 2][2]}   |`
    };
    return [0, 1, 2].map(row).join("\n") + "\n+-------+-------+-------+";
}

console.log(result)

console.log(getString(result.test));




