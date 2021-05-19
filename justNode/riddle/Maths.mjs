

const cache=[[[]]];

const _permCache = x=> {
    if (!cache[x]) {
        const last = _permCache(x - 1);
        const result = [];
        for (let j = 0; j < x; j++) {
            last.forEach(perm => {
                const newPerm = [...perm];
                newPerm.splice(j, 0, x - 1);
                result.push(newPerm);
            });
        }
        cache[x]=result;
    }
    return cache[x];
};

/**
 * Get all Permutations of an Array. Duplicates are not filtered.
 * @param elements {Object[]}
 * @returns {Object[][]}
 */
export const  permutations= (elements)=>{
    const perms = _permCache(elements.length);
    return perms.map(aPerm => aPerm.map(x => elements[x]));
}


/**
 *
 * @param numberOfElementsVector
 * @param n
 * @returns {any[]}
 */
export const nthCombinationVector = (numberOfElementsVector, n) => {
    const length = numberOfElementsVector.length;
    const vector = new Array(length);
    for (let i = 0; i < length; i++) {
        const number = numberOfElementsVector[i];
        if (number > 0) {
            vector[i] = n % number;
            n = Math.floor(n / number);
        } else {
            vector[i] = 0;
        }
    }
    return vector;
}

/**
 * Return a Random Integer Number from the [lower,upper)
 * @param upper {number}
 * @param lower {number}
 * @returns {number}
 */
export const random = (upper,lower=0)=>{
    return lower+Math.floor(Math.random()*(upper-lower));
}