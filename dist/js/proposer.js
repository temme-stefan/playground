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
 * @return {string[]}
 */
function getProposals(informations = []) {
    const words = filterWords(dictionary, getRestraints(informations));
    return getProposalsByLetterScore(words);
}

function getProposalsByLetterScore([...words]) {
    const distribution = getDistribution(words);
    words.sort((a, b) => Math.sign(getDistributionScore(b, distribution) - getDistributionScore(a, distribution)));
    return words;
}

export { getAlphabet, getProposals, setDictionary };
