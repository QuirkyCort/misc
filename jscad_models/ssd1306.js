/**
 * Adapter for SSD1306
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 23, caption: 'Overall height' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MOUNTING_Y_DIST = 23;
const MOUNTING_X_DIST = 20;
const MOUNTING_DIAMETER = 6;

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 32})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 32})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 32})

  return union(center, top, bottom);
}

const legoAxle = (x, y, z, depth, params) => {
  const solids = [];
  const holes = [];

  const length = params.legoAxleLength
  const width = params.legoAxleWidth
  const chamfer = params.legoAxleChamfer

  solids.push(cuboid({size: [length, width, depth], center: [0, 0, 0]}))
  solids.push(cuboid({size: [width, length, depth], center: [0, 0, 0]}))
  solids.push(translate([width/2, width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([-width/2, width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([width/2, -width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([-width/2, -width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))

  return translate([x, y, z], merge(solids, holes))
}

const merge = (solids, holes) => {
  let solid = union(...solids)

  if (holes.length > 0) {
    let hole = union(...holes)
    return subtract(solid, hole);
  }

  return solid;
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const m3 = params.m3;
  const bigger = params.bigger;

  // Mounting points for sensor
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [-MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))

  let yPos = MOUNTING_DIAMETER/2 + MOUNTING_Y_DIST
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [-MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))

  // Beam connecting top to bottom mounting points
  yPos = MOUNTING_DIAMETER/2 + MOUNTING_Y_DIST/2
  solids.push(cuboid({size: [MOUNTING_DIAMETER, MOUNTING_Y_DIST, 8], center: [-MOUNTING_X_DIST/2, yPos, 4]}))
  solids.push(cuboid({size: [MOUNTING_DIAMETER, MOUNTING_Y_DIST, 8], center: [MOUNTING_X_DIST/2, yPos, 4]}))


  // Base
  if (bigger) {
    solids.push(cuboid({size: [MOUNTING_X_DIST, 24, 8], center: [0, 12, 4]}))
  } else {
    solids.push(cuboid({size: [MOUNTING_X_DIST, 16, 8], center: [0, 8, 4]}))
  }

  holes.push(legoHole(0, 4, 4, params))
  holes.push(legoHole(-8, 12, 4, params))
  holes.push(legoHole(0, 12, 4, params))
  holes.push(legoHole(8, 12, 4, params))
  if (bigger) {
    holes.push(legoHole(-8, 20, 4, params))
    holes.push(legoHole(0, 20, 4, params))
    holes.push(legoHole(8, 20, 4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }