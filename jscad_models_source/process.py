#!/usr/bin/env python3

import os

# Lego dimensions
# legoInnerDia: 5,   // 4.8 is the nominal diameter, but 5 is a better fit for 3D printing
# legoOuterDia: 6.4, // 6.2 is the nominal diameter, but 6.4 is a better fit for 3D printing
# legoHeight: 0.9,   // 0.8 is the nominal height, but 0.9 is a better fit for 3D printing

# legoAxleLength: 5,   // 4.8 is the nominal length, but 5 is a better fit for 3D printing
# legoAxleWidth: 1.9,  // 1.8 is the nominal width, but 1.9 is a better fit for 3D printing
# legoAxleChamfer: 0.9 // 0.8 is the nominal chamfer, but 0.9 is a better fit for 3D printing

defaults = open('_preprocessor_defaults', 'r').read()
legoHoles = open('_preprocessor_lego_hole', 'r').read()
legoAxles = open('_preprocessor_lego_axle', 'r').read()

for f in os.listdir('.'):
    if f.endswith('.js'):
        with open(f, 'r') as infile:
            data = infile.read()
        data = data.replace('_PREPROCESSOR_DEFAULTS_', defaults)
        data = data.replace('_PREPROCESSOR_LEGO_HOLE_', legoHoles)
        data = data.replace('_PREPROCESSOR_LEGO_AXLE_', legoAxles)
        with open(os.path.join('../jscad_models/', f), 'w') as outfile:
            outfile.write(data)