const merge = (solids, holes) => {
    let shape = solids[0];

    for (let i=1; i<solids.length; i++) {
        shape = union(shape, solids[i])
    }

    for (let i=0; i<holes.length; i++) {
        shape = subtract(shape, holes[i])
    }

    return shape;
}

module.exports = { merge }
