/**
 * Base for Camera (Does not include adapter)
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid, polygon } = jscad.primitives
const { rotateX, rotateY, rotateZ, translate } = require('@jscad/modeling').transforms
const { extrudeLinear } = require('@jscad/modeling').extrusions
const { measureBoundingBox } = require('@jscad/modeling').measurements

const SWIVEL_THICKNESS = 4;
const SWIVEL_LENGTH = 11;

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'], captions: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'], initial: 'A2' },
    { name: 'tilt', type: 'checkbox', checked: false, caption: 'Tilt Swivel Mount' },
    { name: 'swivelHeight', type: 'float', initial: 26, step: 0.1, caption: 'Swivel Mount Height' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, caption: 'Lego: Height of outer diameter' },
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

const swivel = (params) => {
  const solids = [];
  const holes = [];

  const swivelHeight = params.swivelHeight
  const m3_hole = params.m3_hole;
  const tilt = params.tilt;

  // Swivel mount
  solids.push(cuboid({size: [SWIVEL_THICKNESS, SWIVEL_LENGTH, swivelHeight], center: [0, 0, swivelHeight/2]}));
  solids.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: SWIVEL_LENGTH/2, height: SWIVEL_THICKNESS, segments: 32}))))
  holes.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: m3_hole/2, height: SWIVEL_THICKNESS, segments: 32}))))

  let merged = merge(solids, holes);

  if (tilt) {
    merged = rotateX(30/180*Math.PI, merged);
    let trimBottom = cuboid({size: [100, 100, 100], center: [0, 0, -50]})
    merged = merge([merged], [trimBottom])
    merged = translate([0, 3, 0], merged)
  }
  
  return merged;
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const type = params.type;

  let exclude = [];
  let yOffset = 0;
  if (type == 'A1') {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 8, 4]}))
    exclude = ['1,0'];
    yOffset = 3;
  } else if (type == 'A2') {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 12, 4]}))
    exclude = ['1,0', '1,1'];
    yOffset = 11;
  } else if (type == 'A3') {
    solids.push(cuboid({size: [24, 32, 8], center: [0, 16, 4]}))
    exclude = ['1,1', '1,2'];
    yOffset = 16;
  } else if (type == 'B1') {
    solids.push(cuboid({size: [32, 16, 8], center: [0, 8, 4]}))
    exclude = ['1,0', '2,0'];
    yOffset = 3.5;
  } else if (type == 'B2') {
    solids.push(cuboid({size: [32, 24, 8], center: [0, 12, 4]}))
    exclude = ['1,0', '2,0', '1,1', '2,1'];
    yOffset = 11.5;
  } else if (type == 'B3') {
    solids.push(cuboid({size: [32, 32, 8], center: [0, 16, 4]}))
    exclude = ['1,1', '2,1', '1,2', '2,2'];
    yOffset = 16;
  }

  solids.push(translate([0, yOffset, 0], swivel(params)))

  if (type.includes('A')) {
    for (let x=0; x<3; x++) {
      for (let y=0; y<4; y++) {
        if (exclude.includes(x + ',' + y)) {
          continue;
        }
        holes.push(legoHole(x*8 - 8, y*8 + 4, 4, params))
      }
    }
  } else if (type.includes('B')) {
    for (let x=0; x<4; x++) {
      for (let y=0; y<4; y++) {
        if (exclude.includes(x + ',' + y)) {
          continue;
        }
        holes.push(legoHole(x*8 - 12, y*8 + 4, 4, params))
      }
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }