/**
 * Adapter for 16mm 0shaft adapter to lego axle
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives
const { rotateX, rotateZ, translate } = require('@jscad/modeling').transforms

const getParameterDefinitions = () => {
  return [
    { name: 'major_diameter', type: 'float', initial: 24, caption: 'Major diameter' },
    { name: 'minor_diameter', type: 'float', initial: 9, caption: 'Minor diameter' },
    { name: 'm3_spacing', type: 'float', initial: 16, caption: 'Spacing between M3 holes' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Hole for M3 screw (set to 0 if not needed)' },
    { name: 'height', type: 'float', initial: 8, caption: 'Height' },
    { name: 'protrusion', type: 'float', initial: 8, caption: 'Protrusion height' },
    { name: 'legoAxleLength', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Axle Length' },
    { name: 'legoAxleWidth', type: 'float', initial: 1.8, step: 0.1, caption: 'Lego: Axle Width' },
    { name: 'legoAxleChamfer', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Inner Chamfer Size' },
  ]
}

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 32})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 32})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 32})

  return union(center, union(top, bottom));
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
  let shape = solids[0];

  for (let i=1; i<solids.length; i++) {
    shape = union(shape, solids[i])
  }

  for (let i=0; i<holes.length; i++) {
    shape = subtract(shape, holes[i])
  }

  return shape;
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const major_diameter = params.major_diameter;
  const minor_diameter = params.minor_diameter;
  const m3_spacing = params.m3_spacing;
  const m3 = params.m3;
  const height = params.height;
  const protrusion = params.protrusion;

  // Main body and hole for d shaft
  let totalHeight = height + protrusion;
  solids.push(cylinder({radius: major_diameter/2, height: height, center: [0, 0, height/2], segments: 32}))
  solids.push(cylinder({radius: minor_diameter/2, height: protrusion, center: [0, 0, protrusion/2+height], segments: 32}))

  // Holes for m3
  holes.push(cylinder({radius: m3/2, height: height, center: [m3_spacing/2, 0, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-m3_spacing/2, 0, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [0, m3_spacing/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [0, -m3_spacing/2, height/2], segments: 32}))

  // Hole for axle
  holes.push(legoAxle(0, 0, totalHeight/2, totalHeight, params))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
