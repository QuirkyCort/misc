/**
 * Model for plain base with holes
 */

const jscad = require('@jscad/modeling')

const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid, polygon } = jscad.primitives
const { rotateX, rotateY, rotateZ, translate } = require('@jscad/modeling').transforms

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

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Hole Type', values: ['Lego', 'M3'], captions: ['Lego', 'M3'], initial: 'Lego' },
    { name: 'width', type: 'int', initial: 17, caption: 'Width in Lego units (8mm)' },
    { name: 'length', type: 'int', initial: 25, caption: 'Length in Lego units (8mm)' },
    { name: 'steps', type: 'int', initial: 2, caption: 'Steps between holes' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'legoInnerDia', type: 'float', initial: 5, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.4, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.9, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const width = params.width;
  const length = params.length;
  const steps = params.steps;
  const type = params.type;
  const m3 = params.m3;

  solids.push(cuboid({size: [8*width-8, 8*length, 8], center: [8*width/2, 8*length/2, 0]}))
  solids.push(cuboid({size: [8*width, 8*length-8, 8], center: [8*width/2, 8*length/2, 0]}))

  solids.push(cylinder({radius: 4, height: 8, center: [4, 4, 0], segments: 32}))
  solids.push(cylinder({radius: 4, height: 8, center: [8*width-4, 4, 0], segments: 32}))
  solids.push(cylinder({radius: 4, height: 8, center: [4, 8*length-4, 0], segments: 32}))
  solids.push(cylinder({radius: 4, height: 8, center: [8*width-4, 8*length-4, 0], segments: 32}))

  for (let x=0; x<width; x+=steps) {
    for (let y=0; y<length; y+=steps) {
      let xPos = x * 8 + 4
      let yPos = y * 8 + 4
      if (type == 'Lego') {
        holes.push(legoHole(xPos, yPos, 0, params))
      } else if (type == 'M3') {
        holes.push(cylinder({radius: m3/2, height: 8, center: [xPos, yPos, 0], segments: 32}))
      }
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }