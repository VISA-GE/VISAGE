#!/usr/bin/env python3

import requests
import json

ucsc_genomes = requests.get('https://api.genome.ucsc.edu/list/ucscGenomes').json()["ucscGenomes"]

# Downloaded from https://igv.org.genomes.s3.amazonaws.com/genomes.json
with open('igv.json', 'r') as f:
    igv_genomes = json.load(f)

# Load EVA species information from eva.json
with open('eva.json', 'r') as f:
    eva_data = json.load(f)

def is_qualified(igv_genome: dict) -> bool:
    if not igv_genome['id'] in ucsc_genomes.keys():
        return False

    tracks = igv_genome['tracks']
    refgene_tracks = [t for t in tracks if t['format'] == 'refgene']

    if len(refgene_tracks) == 0:
        return False

    if len(refgene_tracks) > 1:
        print(f"Multiple refgene tracks found for {igv_genome['id']}")
        return False

    if not igv_genome['id'] in eva_data.keys():
        return False

    return True

filtered_genomes = [g for g in igv_genomes if is_qualified(g)]

def enhance_genome(igv_genome: dict) -> dict:
    genome_id = igv_genome['id']
    ucsc_genome = ucsc_genomes[genome_id]

    eva_info = {
        "evaSpecies": eva_data[genome_id].get("evaSpecies"),
        "trackHubId": eva_data[genome_id].get("trackHubId")
    }

    return {
        **igv_genome,
        **ucsc_genome,
        **eva_info
    }

enhanced_genomes = [enhance_genome(g) for g in filtered_genomes]

with open('genomes.ts', 'w') as f:
    f.write('export const genomes = ')
    json.dump(enhanced_genomes, f, indent=4)
