/**
 * Adapter for VL53L0X / VL53L1X
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 15, caption: 'Height of mouting holes from base' },
    { name: 'width', type: 'float', initial: 6, step: 0.5, caption: 'Width of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, caption: 'Diameter of M3 holes' },
    { name: 'size', type: 'choice', caption: 'Distance between sensor mounting holes', values: [19.8, 17, -1], captions: ['19.8', '17', 'Custom'], initial: 19.8 },
    { name: 'customSize', type: 'float', initial: 19.8, caption: 'Custom size (only used if previous option is set to "Custom")' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'B1', 'B2'], captions: ['A1', 'A2', 'B1', 'B2'], initial: 'A1' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const width = params.width;
  const m3 = params.m3;
  const size = params.size;
  const customSize = params.customSize;
  const type = params.type;

  // Mounting points for sensor
  let mounting_holes_distance = size;
  if (mounting_holes_distance < 0) {
    mounting_holes_distance = customSize;
  }

  const holes_offset = mounting_holes_distance / 2
  solids.push(translate([holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: width/2, height: 7, segments: 32}))))
  solids.push(translate([-holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: width/2, height: 7, segments: 32}))))
  solids.push(cuboid({size: [width, 7, height], center: [holes_offset, 0, height/2]}))
  solids.push(cuboid({size: [width, 7, height], center: [-holes_offset, 0, height/2]}))
  solids.push(cuboid({size: [mounting_holes_distance, 7, 8], center: [0, 0, 4]}))

  holes.push(translate([holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: m3/2, height: 10, segments: 32}))))
  holes.push(translate([-holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: m3/2, height: 10, segments: 32}))))


  // Base
  if (type == 'A1') {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 4.5, 4]}))
  } else if (type == 'A2') {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 8.5, 4]}))
  } else if (type == 'B1') {
    solids.push(cuboid({size: [16, 16, 8], center: [0, 4.5, 4]}))
  } else if (type == 'B2') {
    solids.push(cuboid({size: [16, 24, 8], center: [0, 8.5, 4]}))
  }

  if (type == 'A1' || type == 'A2') {
    holes.push(legoHole(0, 0.5, 4, params))
    holes.push(legoHole(0, 8.5, 4, params))
    holes.push(legoHole(8, 8.5, 4, params))
    holes.push(legoHole(-8, 8.5, 4, params))
    holes.push(legoHole(0, 16.5, 4, params))
    holes.push(legoHole(8, 16.5, 4, params))
    holes.push(legoHole(-8, 16.5, 4, params))
  } else if (type == 'B1' || type == 'B2') {
    holes.push(legoHole(-4, 8.5, 4, params))
    holes.push(legoHole(4, 8.5, 4, params))
    holes.push(legoHole(-4, 16.5, 4, params))
    holes.push(legoHole(4, 16.5, 4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
