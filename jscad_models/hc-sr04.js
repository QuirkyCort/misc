/**
 * Adapter for HC-SR04
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { rotateX, translate } = require('@jscad/modeling').transforms
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 30, caption: 'Height (base to top of HC-SR04)' },
    { name: 'diameter', type: 'float', initial: 16, step: 0.1, caption: 'Diameter of sensors' },
    { name: 'width', type: 'float', initial: 42, step: 0.1, caption: 'Width of sensors (measured between outer edges)' },
    { name: 'screwOffset', type: 'float', initial: 3.5, step: 0.1, caption: 'Distance between securing screw and sensor edge' },
    { name: 'm3', type: 'float', initial: 2.8, caption: 'Diameter of M3 holes' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'B1', 'B2'], captions: ['A1', 'A2', 'B1', 'B2'], initial: 'A1' },
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

const THICKNESS = 5;
const TOP_BORDER = 3;

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const diameter = params.diameter;
  const width = params.width;
  const screwOffset = params.screwOffset;
  const m3 = params.m3;
  const type = params.type;

  const center2center = (width-diameter)/2;

  // Mounting points for sensor
  solids.push(cuboid({size: [width+12, THICKNESS, height], center: [0, 0, height/2]}))
  holes.push(translate([center2center, 0, height-diameter/2-TOP_BORDER], rotateX(Math.PI/2, cylinder({radius: diameter/2, height: THICKNESS, segments: 32}))))
  holes.push(translate([-center2center, 0, height-diameter/2-TOP_BORDER], rotateX(Math.PI/2, cylinder({radius: diameter/2, height: THICKNESS, segments: 32}))))
  holes.push(cuboid({size: [width-(diameter/3), THICKNESS, diameter/2+TOP_BORDER], center: [0, 0, height-(diameter/2+TOP_BORDER)/2]}))
  holes.push(cuboid({size: [width-diameter/3, THICKNESS, diameter/2], center: [0, 0, height-TOP_BORDER-diameter+diameter/4]}))

  // Hole for oscillator
  holes.push(cuboid({size: [13, THICKNESS, 3], center: [0, 0, height-(diameter+TOP_BORDER)-1.5]}))

  // Securing screws
  holes.push(translate([width/2+screwOffset, 0, height-TOP_BORDER], rotateX(Math.PI/2, cylinder({radius: m3/2, height: THICKNESS, segments: 32}))))
  holes.push(translate([-width/2-screwOffset, 0, height-TOP_BORDER], rotateX(Math.PI/2, cylinder({radius: m3/2, height: THICKNESS, segments: 32}))))
  holes.push(translate([width/2+screwOffset, 0, height-TOP_BORDER-diameter], rotateX(Math.PI/2, cylinder({radius: m3/2, height: THICKNESS, segments: 32}))))
  holes.push(translate([-width/2-screwOffset, 0, height-TOP_BORDER-diameter], rotateX(Math.PI/2, cylinder({radius: m3/2, height: THICKNESS, segments: 32}))))

  // Base
  if (type == 'A1') {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 8+THICKNESS/2, 4]}))
  } else if (type == 'A2') {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 12+THICKNESS/2, 4]}))
  } else if (type == 'B1') {
    solids.push(cuboid({size: [16, 16, 8], center: [0, 8+THICKNESS/2, 4]}))
  } else if (type == 'B2') {
    solids.push(cuboid({size: [16, 24, 8], center: [0, 12+THICKNESS/2, 4]}))
  }

  if (type == 'A1' || type == 'A2') {
    for (let y=0; y<=3; y++) {
      for (let x=-1; x<=1; x++) {
        holes.push(legoHole(x*8, y*8+THICKNESS/2+4, 4, params))
      }
    }
  } else if (type == 'B1' || type == 'B2') {
    for (let y=0; y<=3; y++) {
      for (let x=0; x<=1; x++) {
        holes.push(legoHole((x*8+4), y*8+THICKNESS/2+4, 4, params))
        holes.push(legoHole(-(x*8+4), y*8+THICKNESS/2+4, 4, params))
      }
    }
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
