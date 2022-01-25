const dictionary = [];
const alphabet = [];

/**
 * @param dict {string[]}
 */
function setDictionary(dict) {
    dictionary.splice(0, dictionary.length, ...dict);
    const alpha = new Set();
    dictionary.forEach(s => s.split("").forEach(c => alpha.add(c)));
    alphabet.splice(0, alphabet.length, ...alpha);
    alphabet.sort();
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
    return word.split("").map(s => parseInt(s)).reduce((a, v, i) => a + distribution[i][v], 0);
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
 * @param informations {Map<string,{here:number[],not_here_but:number[],not_here:number[]}>}
 * @return {{function(string): boolean}[]}
 */
function getRestraints(informations) {
    /**
     * @type {{function(string):boolean}[]}
     */
    const restraint = [];
    [...informations.entries()].forEach(([val, {here, not_here_but, not_here}]) => {
        restraint.push(...here.map(i => getAtRestraint(val, i)));
        restraint.push(...not_here_but.map(i => getSomeButRestraint(val, i)));
        if (here.length == 0 && not_here.length > 0) {
            restraint.push(getNotRestraint(val));
        }
        if (here.length > 0 && not_here.length > 0) {
            restraint.push(...[0, 1, 2, 3, 4].filter(x => !here.includes(x)).map(i => getSomeButRestraint(val, i)));
        }
    });
    return restraint;
}

/**
 *
 * @param informations {Map<string,{here:number[],not_here_but:number[],not_here:number[]}>}
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
 * @param information {Map<string,{here:number[],not_here_but:number[],not_here:number[]}>}
 * @return {string[]}
 */
function getProposalsByPartition([...words], information) {
    if (words.length == 0) return words;
    console.log("start", words.length);
    const getPartitionScore = (word, print = false) => {
        const notFixed = word.split("").map((c, i) => [c, i]).filter(([c, i]) => !information.get(c).here.includes(i));
        const partitions = notFixed.reduce((partition, [c, i]) =>
                partition.map((wordlist) => {
                    const here = wordlist.filter(getAtRestraint(c, i));
                    const not_here_but = wordlist.filter(getSomeButRestraint(c, i));
                    let not_here = wordlist;
                    if (information.get(c).here.length == 0) {
                        not_here = not_here.filter(getNotRestraint(c));
                    } else {
                        [0, 1, 2, 3, 4].filter(l => !information.get(c).here.includes(l)).forEach(l => {
                            not_here = not_here.filter(getSomeButRestraint(c, l));
                        });
                    }
                    return [here, not_here_but, not_here].filter(({length}) => length > 0);
                }).flat()
            , [words]);
        const avaragesize = words.length / partitions.length;
        const score = partitions.reduce((a, {length}) => a + Math.pow(Math.abs(avaragesize - length), 2), 0);
        if (print) {
            console.log(partitions);
        }
        return score;
    };
    const lookUp = new Map(words.map(w => [w, getPartitionScore(w)]));
    words.sort((a, b) => Math.sign(lookUp.get(a) - lookUp.get(b)));
    getPartitionScore(words[0], true);
    return words;

}

function getProposalsByLetterScore([...words]) {
    const distribution = getDistribution(words);
    words.sort((a, b) => Math.sign(getDistributionScore(b, distribution) - getDistributionScore(a, distribution)));
    return words;
}

export { getAlphabet, getProposals, setDictionary };
