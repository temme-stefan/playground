const dictionary = [];
const alphabet = [];

/**
 * @param dict {string[]}
 */
function setDictionary(dict) {

    dictionary.splice(0, dictionary.length, ...sanitizeDict(dict));
    const alpha = new Set();
    dictionary.forEach(s => s.split("").forEach(c => alpha.add(c)));
    alphabet.splice(0, alphabet.length, ...alpha);
    alphabet.sort();
}

/**
 * @param dict {string[]}
 * @return {string[]}
 */
function sanitizeDict(dict) {
    const sanitized = [...new Set(dict.map(s => s.toUpperCase()))];
    if (sanitized.length < dict.length) {
        console.log("Removes Duplicates", dict.length - sanitized.length);
    }
    return sanitized;
}

/**
 * @return {string[]}
 */
function getAlphabet() {
    return [...alphabet];
}

/**
 * @param words string[]
 * @return {number[][]}
 */
function getDistribution(words) {
    const distribution = Array.from({length: 5}, _ => Array.from(alphabet, _ => 0));

    words.forEach(p => {

        for (let i = 0; i < distribution.length; i++) {
            const ind = alphabet.indexOf(p[i]);
            distribution[i][ind]++;
        }
    });
    return distribution;
}

function getDistributionScore(word, distribution) {
    return word.split("").map(s => alphabet.indexOf(s)).reduce((a, v, i) => a + distribution[i][v], 0);
}


/**
 *
 * @param words {string[]}
 * @param restraints {{function(string):boolean}[]}
 * @return {string[]}
 */
function filterWords(words, restraints) {
    const restraint = restraints.reduce((a, f) => (x) => a(x) && f(x), (x) => true);
    return words.filter(restraint);
}

/**
 *
 * @param words {string[]}
 * @param restraints {{function(string):boolean}[]}
 * @return {number}
 */
function countWords(words, restraints) {
    const restraint = restraints.reduce((a, f) => (x) => a(x) && f(x), (x) => true);
    return words.filter(restraint).length;
}

/**
 * @param some {string}
 * @param but {number}
 * @return {function(string):boolean}
 */
function getSomeButRestraint(some, but) {
    return x => x.includes(some) && x[but] != some;
}

/**
 * @param not {string}
 * @return {function(string):boolean}
 */
function getNotRestraint(not) {
    return (x) => !x.includes(not)
}

/**
 * @param some {string}
 * @param at {number}
 * @return {function(string):boolean}
 */
function getAtRestraint(some, at) {
    return x => x[at] == some;
}

/**
 * @param some {string}
 * @param at {number[]}
 * @return {function(string):boolean}
 */
function getSomeAtRestraint(some, at) {
    /**
     * @param w {string}
     * @return {boolean}
     */
    const def = w => false;
    return at.reduce((a, i) => w => w[i] == some || a(w), def);
}

/**
 * @param row {{pos: number, state: 'here' | 'somewhere' | 'no', value: string}[]}
 * @return {{function(string): boolean}[]}
 */
function getRowRestraints(row) {
    const m = new Map();
    const rowRestraints = [];
    const add = ({value, state, pos}) => {
        const k = m.get(value) ?? {here: [], somewhere: [], no: []};
        k[state].push(pos);
        m.set(value, k);
    }
    row.forEach(c => add(c));
    [...m.entries()].forEach(([val, {here, somewhere, no}]) => {
        const p = {
            minCount: 0,
            maxCount: 5
        };
        p.minCount = here.length + somewhere.length;
        if (no.length > 0) {
            p.maxCount = p.minCount;
        }
        rowRestraints.push(w => {
            const count = w.split("").filter(c => c == val).length;
            return count >= p.minCount && count <= p.maxCount;
        });
        rowRestraints.push(...here.map((i) => w => w[i] == val));
        rowRestraints.push(...somewhere.map((i) => w => w[i] != val));


    });
    return rowRestraints;
}

/**
 * @param informations {{pos: number, state: 'here' | 'somewhere' | 'no', value: string}[][]}
 * @return {{function(string): boolean}[]}
 */
function getRestraints(informations) {
    /**
     * @type {{function(string):boolean}[]}
     */
    const restraint = [];
    informations.forEach(row => {
        restraint.push(...getRowRestraints(row));
    });
    return restraint;
}

/**
 *
 * @param informations {{pos: number, state: 'here' | 'somewhere' | 'no', value: string}[][]}
 * @param strategie {string}
 * @return {Promise<string[]>}
 */
function getProposals(informations, strategie = "propabilty") {
    const words = filterWords(dictionary, getRestraints(informations));
    return new Promise(async (resolve, reject) => {
        switch (strategie) {
            case "propabilty":
                resolve(getProposalsByLetterScore(words));
                break;
            case "minimum_result":
                const props = getProposalsByPartition(words, informations);
                resolve(props);
                break;
            default:
                reject(new Error("unknown strategie: " + strategie));
                break;
        }
    });
}

/**
 * @param words {string[]}
 * @param information {{pos: number, state: 'here' | 'somewhere' | 'no', value: string}[][]}
 * @return {string[]}
 */
function getProposalsByPartition([...words], information) {
    if (words.length == 0 || information.length==0) return words;
    console.log("start", words.length);

    const fixed =new Set( information.flat().filter(({state})=>state=="here").map(({pos})=>pos));
    const rowInformation = Array.from({length: 5},(_,pos)=>{
        return {pos,state:fixed.has(pos)?'here':null};
    });
    let allPoss=[rowInformation]
    for (let i =0 ; i<rowInformation.length;i++){
        if (rowInformation[i].state==null){
            allPoss = ["here","somewhere","no"].map(s=>allPoss.map(([...p])=>{
                p[i]={...p[i],state: s};
                return p;
            })).flat();
        }
    }
    const getPartitionScore = (word, print = false) => {
        allPoss.forEach(p=>p.forEach((c,i)=>c.value=word[i]));

        const partitions = allPoss.map(rowInformation=> countWords(words, getRowRestraints(rowInformation) ))
            .filter(x=>x>0);
        const avaragesize = words.length / partitions.length;
        const score = partitions.reduce((a, b) => a + Math.pow(Math.abs(avaragesize - b), 2), 0);
        if (print) {
            console.log(partitions);
        }
        return score;
    };
    const lookUp = new Map(words.map(w => [w, getPartitionScore(w)]));
    words.sort((a, b) => Math.sign(lookUp.get(a) - lookUp.get(b)));
    if (information.length==0){
        console.log(JSON.stringify(words));
    }
    getPartitionScore(words[0],true);

    return words;

}

function getProposalsByLetterScore([...words]) {
    const distribution = getDistribution(words);
    words.sort((a, b) => Math.sign(getDistributionScore(b, distribution) - getDistributionScore(a, distribution)));
    return words;
}

export {getAlphabet, getProposals, setDictionary};
