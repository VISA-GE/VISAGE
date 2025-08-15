#!/usr/bin/env python3

import requests
import json

pathways = requests.get('https://www.wikipathways.org/json/getPathwayInfo.json').json()['pathwayInfo']

with open('pathways.ts', 'w') as f:
    f.write('export const pathways = ')
    json.dump(pathways, f, indent=4)
