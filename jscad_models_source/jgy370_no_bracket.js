/**
 * Adapter for JGY370 motors without metal brackets
 */

const jscad = require('@jscad/modeling')
const { mirrorY } = require('@jscad/modeling').transforms
const { extrudeLinear } = require('@jscad/modeling').extrusions

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'side', type: 'choice', caption: 'Side', values: ['Left', 'Right'], captions: ['Left', 'Right'], initial: 'Left' },
    { name: 'width', type: 'int', initial: 5, step: 1, min: 3, caption: 'Base Width in Lego units (8mm)' },
    { name: 'length', type: 'int', initial: 3, step: 1, min:3, caption: 'Base Length in Lego units (8mm)' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOTOR_HOLES_X = 33;
const MOTOR_HOLES_Z = 18;
const MOTOR_HOLES_X_OFFSET = 13/2;
const MOTOR_HOLES_Z_OFFSET = 7;
const MOTOR_CENTER_HOLE_DIAMETER = 7;
const THICKNESS = 3;
const INNER_WIDTH = 46;
const INNER_HEIGHT = 32;
const CLEARANCE = 1;

const main = (params) => {
  const solids = [];
  const holes = [];

  const side = params.side;
  const width = params.width;
  const length = params.length;
  const m3 = params.m3_hole;

  let baseWidth = width * 8 + THICKNESS;
  let baseLength = length * 8;
  let baseOffset = -((INNER_WIDTH+THICKNESS+CLEARANCE)/2 - baseWidth/2);

  let polarity = 1;
  if (side == 'Right') {
    polarity = -1;
  }

  // Base
  solids.push(cuboid({size: [baseWidth, baseLength, 8], center: [baseOffset, 0, 0]}))

  // Flange for motor
  let referenceX = -(INNER_WIDTH+THICKNESS+CLEARANCE)/2+THICKNESS+CLEARANCE;
  let referenceZ = 4 + CLEARANCE;
  let referenceY = polarity * (THICKNESS/2 + baseLength/2);
  solids.push(cuboid({size: [INNER_WIDTH+THICKNESS+CLEARANCE, THICKNESS, 8+INNER_HEIGHT+CLEARANCE], center: [0, referenceY, (8+INNER_HEIGHT+CLEARANCE)/2-4]}))

  // Hole for motor shaft
  holes.push(
    translate([referenceX+CLEARANCE+15, referenceY, referenceZ+16],
      rotateX(Math.PI/2,
        cylinder({radius: MOTOR_CENTER_HOLE_DIAMETER/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )

  // Screw holes for motor
  holes.push(
    translate([referenceX+MOTOR_HOLES_X_OFFSET, referenceY, referenceZ+MOTOR_HOLES_Z_OFFSET],
      rotateX(Math.PI/2,
        cylinder({radius: m3/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )
  holes.push(
    translate([referenceX+MOTOR_HOLES_X_OFFSET, referenceY, referenceZ+MOTOR_HOLES_Z_OFFSET+MOTOR_HOLES_Z],
      rotateX(Math.PI/2,
        cylinder({radius: m3/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )
  holes.push(
    translate([referenceX+MOTOR_HOLES_X_OFFSET+MOTOR_HOLES_X, referenceY, referenceZ+MOTOR_HOLES_Z_OFFSET],
      rotateX(Math.PI/2,
        cylinder({radius: m3/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )
  holes.push(
    translate([referenceX+MOTOR_HOLES_X_OFFSET+MOTOR_HOLES_X, referenceY, referenceZ+MOTOR_HOLES_Z_OFFSET+MOTOR_HOLES_Z],
      rotateX(Math.PI/2,
        cylinder({radius: m3/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )

  // Gusset
  let gusset = translate(
    [referenceX-CLEARANCE, baseLength/2, 4],
    rotateY(-Math.PI/2,
      extrudeLinear(
        {height: THICKNESS},
        polygon({ points: [ [0, 0], [0, -24], [INNER_HEIGHT+CLEARANCE, 0] ] })
      )
    )
  )

  if (side == 'Right') {
    gusset = mirrorY(gusset)
  }

  solids.push(gusset)

  // Lego Holes
  let yOffset = -baseLength/2 + 4;
  for (let x=0; x<width; x++) {
    for (let y=0; y<length; y++) {
      holes.push(legoHole(-baseWidth/2 + x*8 + 4 + THICKNESS + baseOffset, yOffset + y*8, 0, params))
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
