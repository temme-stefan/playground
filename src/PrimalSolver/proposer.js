const dictionary = [];
const alphabet = [];

/**
  * @param dict {string[]}
 */
export function setDictionary(dict) {
    dictionary.splice(0, dictionary.length, ...dict);
    const alpha = new Set();
    dictionary.forEach(s => s.split("").forEach(c => alpha.add(c)));
    alphabet.splice(0, alphabet.length, ...alpha);
    alphabet.sort();
}

/**
 * @return {string[]}
 */
export function getAlphabet() {
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

function getScore(word, distribution) {
    return word.split("").map(s => parseInt(s)).reduce((a, v, i) => a + distribution[i][v], 0);
}


function getSorted([...words], distribution) {
    words.sort((a, b) => Math.sign(getScore(b, distribution) - getScore(a, distribution)));
    return words;
}

function filterWords(words, ...restraints) {
    const restraint = restraints.reduce((a, f) => (x) => a(x) && f(x), (x) => true);
    return words.filter(restraint);
}

export function getSomeButRestraint(some, but) {
    return x => x.includes(some) && x[but] != some;
}

export function getNotRestraint(not) {
    return (x) => !x.includes(not)
}

export function getAtRestraint(some, at) {
    return x => x[at] == some;
}

export function getProposals(restraints = []) {
    const words = filterWords(dictionary, ...restraints);
    return getSorted(words, getDistribution(words));
}





