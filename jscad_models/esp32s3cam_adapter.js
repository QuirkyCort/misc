/**
 * Adapter for ESP32-Cam (Does not include base)
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid, polygon } = jscad.primitives
const { rotateY, rotateZ, translate } = require('@jscad/modeling').transforms
const { extrudeLinear } = require('@jscad/modeling').extrusions
const { measureBoundingBox } = require('@jscad/modeling').measurements

const ESP32_Length = 57.5;
const FRONT_THICKNESS = 2;
const BACK_THICKNESS = 2;
const SCREW_OFFSET = 3.5;
const SCREW_BASE_WIDTH = 7;
const SCREW_BASE_THICKNESS = 7;
const FRONT_PCB_SUPPORT_THICKNESS = 0;
const FRONT_PCB_SUPPORT_LENGTH = 0;
const SWIVEL_THICKNESS = 4;
const SWIVEL_LENGTH = 11;
const LED_HOLE_X_OFFSET = -10;
const LED_HOLE_Y_OFFSET = -16;

const getParameterDefinitions = () => {
  return [
    { name: 'camWidth', type: 'float', initial: 9, step: 0.1, caption: 'Camera Width' },
    { name: 'camHeight', type: 'float', initial: 9, step: 0.1, caption: 'Camera Height' },
    { name: 'camYOffset', type: 'float', initial: 10, step: 0.1, caption: 'Camera Y Offset' },
    { name: 'swivelXOffset', type: 'float', initial: 4, step: 0.1, caption: 'Swivel Mount X Offset' },
    { name: 'swivelYOffset', type: 'float', initial: 12, step: 0.1, caption: 'Swivel Mount Y Offset' },
    { name: 'swivelHeight', type: 'float', initial: 8, step: 0.1, caption: 'Swivel Mount Height' },
    { name: 'ledHoleRadius', type: 'float', initial: 7, step: 0.5, caption: 'Radius of LED Hole' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
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

const front = (params) => {
  const solids = [];
  const holes = [];

  const camWidth = params.camWidth
  const camHeight = params.camHeight
  const camYOffset = params.camYOffset
  const width = camWidth + 4;
  const ledHoleRadius = params.ledHoleRadius
  const m3 = params.m3;

  solids.push(cuboid({size: [width, ESP32_Length, FRONT_THICKNESS], center: [0, 0, FRONT_THICKNESS/2]}));
  holes.push(cuboid({size: [camWidth, camHeight, FRONT_THICKNESS], center: [0, camYOffset, FRONT_THICKNESS/2]}));

  // Support for PCB
  solids.push(cuboid({size: [width, FRONT_PCB_SUPPORT_LENGTH, FRONT_PCB_SUPPORT_THICKNESS], center: [0, FRONT_PCB_SUPPORT_LENGTH/2-ESP32_Length/2, FRONT_PCB_SUPPORT_THICKNESS/2 + FRONT_THICKNESS]}));

  // Screw mounts base
  let xOuter = width / 2;
  let xInner = SCREW_BASE_WIDTH / 2;
  let yBase = ESP32_Length / 2;
  let yScrew = yBase + SCREW_OFFSET;
  solids.push(
    translate(
      [0, 0, 0],
      extrudeLinear(
        {height: SCREW_BASE_THICKNESS},
        polygon({ points: [ [xOuter, yBase], [xInner, yScrew], [-xInner, yScrew], [-xOuter, yBase] ] })
      )
    )
  )
  solids.push(cylinder({radius: SCREW_BASE_WIDTH/2, height: SCREW_BASE_THICKNESS, center: [0, yScrew, SCREW_BASE_THICKNESS/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: SCREW_BASE_THICKNESS, center: [0, yScrew, SCREW_BASE_THICKNESS/2], segments: 32}))

  xOuter = xOuter;
  xInner = width / 2 - SCREW_BASE_WIDTH;
  yBase = -yBase;
  yScrew = -yScrew;
  solids.push(
    translate(
      [0, 0, 0],
      extrudeLinear(
        {height: SCREW_BASE_THICKNESS},
        polygon({ points: [ [xOuter, yBase], [xInner + 1, yBase], [xInner + 1, yScrew], [xOuter + 1, yScrew]  ] })
      )
    )
  )
  solids.push(cylinder({radius: SCREW_BASE_WIDTH/2, height: SCREW_BASE_THICKNESS, center: [width/2 - SCREW_BASE_WIDTH/2 + 1, yScrew, SCREW_BASE_THICKNESS/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: SCREW_BASE_THICKNESS, center: [width/2 - SCREW_BASE_WIDTH/2 + 1, yScrew, SCREW_BASE_THICKNESS/2], segments: 32}))

  // Clearance hole for flash LED
  holes.push(cylinder({radius: ledHoleRadius, height: SCREW_BASE_THICKNESS, center: [LED_HOLE_X_OFFSET, LED_HOLE_Y_OFFSET, SCREW_BASE_THICKNESS/2], segments: 32}))

  return merge(solids, holes);
}

const back = (params) => {
  const solids = [];
  const holes = [];

  const camWidth = params.camWidth
  const width = camWidth + 4;
  const swivelXOffset = params.swivelXOffset
  const swivelYOffset = params.swivelYOffset
  const swivelHeight = params.swivelHeight
  const m3_hole = params.m3_hole;

  solids.push(cuboid({size: [width, ESP32_Length, BACK_THICKNESS], center: [0, 0, BACK_THICKNESS/2]}));

  // Swivel mount
  solids.push(cuboid({size: [SWIVEL_THICKNESS, SWIVEL_LENGTH, swivelHeight], center: [swivelXOffset, -swivelYOffset, swivelHeight/2 + BACK_THICKNESS]}));
  solids.push(translate([swivelXOffset, -swivelYOffset, swivelHeight+BACK_THICKNESS], rotateY(Math.PI/2, cylinder({radius: SWIVEL_LENGTH/2, height: SWIVEL_THICKNESS, segments: 32}))))
  holes.push(translate([swivelXOffset, -swivelYOffset, swivelHeight+BACK_THICKNESS], rotateY(Math.PI/2, cylinder({radius: m3_hole/2, height: SWIVEL_THICKNESS, segments: 32}))))

  // Screw mounts base
  let xOuter = width / 2;
  let xInner = SCREW_BASE_WIDTH / 2;
  let yBase = ESP32_Length / 2;
  let yScrew = yBase + SCREW_OFFSET;
  solids.push(
    translate(
      [0, 0, 0],
      extrudeLinear(
        {height: BACK_THICKNESS},
        polygon({ points: [ [xOuter, yBase], [xInner, yScrew], [-xInner, yScrew], [-xOuter, yBase] ] })
      )
    )
  )
  solids.push(cylinder({radius: SCREW_BASE_WIDTH/2, height: BACK_THICKNESS, center: [0, yScrew, BACK_THICKNESS/2], segments: 32}))
  holes.push(cylinder({radius: m3_hole/2, height: BACK_THICKNESS, center: [0, yScrew, BACK_THICKNESS/2], segments: 32}))

  xOuter = xOuter;
  xInner = width / 2 - SCREW_BASE_WIDTH;
  yBase = -yBase;
  yScrew = -yScrew;
  solids.push(
    translate(
      [0, 0, 0],
      extrudeLinear(
        {height: BACK_THICKNESS},
        polygon({ points: [ [xOuter, yBase], [xInner + 1, yBase], [xInner + 1, yScrew], [xOuter + 1, yScrew]  ] })
      )
    )
  )
  solids.push(cylinder({radius: SCREW_BASE_WIDTH/2, height: BACK_THICKNESS, center: [width/2 - SCREW_BASE_WIDTH/2 + 1, yScrew, BACK_THICKNESS/2], segments: 32}))
  holes.push(cylinder({radius: m3_hole/2, height: BACK_THICKNESS, center: [width/2 - SCREW_BASE_WIDTH/2 + 1, yScrew, BACK_THICKNESS/2], segments: 32}))

  return merge(solids, holes);
}

const main = (params) => {
  let frontPart = front(params)
  let backPart = back(params)

  let boundingBox = measureBoundingBox(frontPart)
  let maxX = boundingBox[1][0];
  frontPart = translate([-maxX - 2, 0, 0], frontPart);

  boundingBox = measureBoundingBox(backPart)
  let minX = boundingBox[0][0];
  backPart = translate([-minX + 2, 0, 0], backPart);

  return [frontPart, backPart];
}

module.exports = { getParameterDefinitions, main }