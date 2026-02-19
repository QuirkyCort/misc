/**
 * Adapter for JGA25 motors without metal brackets
 */

const jscad = require('@jscad/modeling')
const { extrudeLinear } = require('@jscad/modeling').extrusions

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'width', type: 'int', initial: 3, step: 1, min: 3, caption: 'Base Width in Lego units (8mm)' },
    { name: 'length', type: 'int', initial: 6, step: 1, min:4, caption: 'Base Length in Lego units (8mm)' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOTOR_HOLES_X = 17;
const MOTOR_CENTER_HOLE_DIAMETER = 7.5;
const THICKNESS = 3;
const INNER_WIDTH = 26;

const main = (params) => {
  const solids = [];
  const holes = [];

  const width = params.width;
  const length = params.length;
  const m3 = params.m3_hole;

  let baseWidth = Math.max(width * 8, INNER_WIDTH + THICKNESS * 2);
  let baseLength = length * 8;
  let xOffset = 4;
  if (width % 2) {
    xOffset = 0;
  }

  // Base
  solids.push(cuboid({size: [baseWidth, baseLength, 8], center: [0, baseLength/2, 0]}))

  // Flange for motor
  solids.push(cuboid({size: [INNER_WIDTH+THICKNESS*2, THICKNESS, 8+INNER_WIDTH], center: [0, THICKNESS/2, (8+INNER_WIDTH)/2-4]}))
  holes.push(
    translate([0, THICKNESS/2, 4+INNER_WIDTH/2],
      rotateX(Math.PI/2,
        cylinder({radius: MOTOR_CENTER_HOLE_DIAMETER/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )

  // Screw holes for motor
  holes.push(
    translate([MOTOR_HOLES_X/2, THICKNESS/2, 4+INNER_WIDTH/2],
      rotateX(Math.PI/2,
        cylinder({radius: m3/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )
  holes.push(
    translate([-MOTOR_HOLES_X/2, THICKNESS/2, 4+INNER_WIDTH/2],
      rotateX(Math.PI/2,
        cylinder({radius: m3/2, height: THICKNESS, center: [0, 0, 0], segments: 32})
      )
    )
  )

  // Gusset
  solids.push(
    translate(
      [INNER_WIDTH/2+THICKNESS, THICKNESS, 4],
      rotateY(-Math.PI/2,
        extrudeLinear(
          {height: THICKNESS},
          polygon({ points: [ [0, 0], [INNER_WIDTH, 0], [0, INNER_WIDTH] ] })
        )
      )
    )
  )
  solids.push(
    translate(
      [-INNER_WIDTH/2, THICKNESS, 4],
      rotateY(-Math.PI/2,
        extrudeLinear(
          {height: THICKNESS},
          polygon({ points: [ [0, 0], [INNER_WIDTH, 0], [0, INNER_WIDTH] ] })
        )
      )
    )
  )

  // Lego Holes
  for (let x=1; x<(width / 2); x++) {
    for (let y=0; y<length; y++) {
      if (width %2) {
        if (y == 0 && x < 3) continue; // Skip holes that overlaps flange
        if (x == 2 && y < 4) continue; // Skip holes that overlaps gusset
      } else {
        if (y == 0 && x < 2) continue; // Skip holes that overlaps flange (even widths)
        if (x == 1 && y < 4) continue; // Skip holes that overlaps gusset (even widths)
      }
      holes.push(legoHole(xOffset + x*8, 4 + y*8, 0, params))
      holes.push(legoHole(-(xOffset + x*8), 4 + y*8, 0, params))
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
