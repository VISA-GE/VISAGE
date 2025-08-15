import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface SNP {
  name: string;
  chr: string;
  range: {
    start: number;
    end: number;
  };
  type: 'snp';
  ref: string;
  alt: string;
  representation?: string;
}

/**
 * Fetches SNPs in a genomic range from the European Variation Archive with pagination
 * @param species The EVA species identifier
 * @param chr Chromosome
 * @param start Start position
 * @param end End position
 * @param limit Maximum number of results per request (max 10000)
 * @param skip Number of results to skip (for pagination)
 * @returns Array of SNPs for the current page
 */
export async function fetchSNPsInRange(
  species: string,
  chr: string,
  start: number,
  end: number,
  limit = 1000,
  skip = 0
): Promise<{ snps: SNP[]; totalCount: number }> {
  if (!species) {
    console.warn('No EVA species specified');
    return { snps: [], totalCount: 0 };
  }

  // EVA API rate limits to 10000 max results per request
  const maxLimit = 10000;
  if (limit > maxLimit) {
    limit = maxLimit;
    console.warn(`Limit adjusted to EVA API maximum of ${maxLimit}`);
  }

  try {
    // Add limit and skip parameters for pagination
    const response = await fetch(
      `https://www.ebi.ac.uk/eva/webservices/rest/v1/segments/${chr}:${start}-${end}/variants?species=${species}&limit=${limit}&skip=${skip}`
    );

    if (!response.ok) {
      throw new Error(`EVA API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.response?.[0]?.result) {
      return { snps: [], totalCount: 0 };
    }

    // Get total count for pagination
    const totalCount = data.response[0].numTotalResults || 0;

    const snps = data.response[0].result
      .map((entry: any): SNP => {
        // Extract rsIDs from source entries
        const rsids = Object.values(entry.sourceEntries || {})
          .map(
            (sourceEntry: any) => sourceEntry.attributes?.src?.split('\t')[2]
          )
          .filter((name: string) => name && name.match(/^rs\d+$/));

        // Create HTML representation for display
        const representation = rsids
          .map(
            (rsid: string) =>
              `<a href='https://www.ncbi.nlm.nih.gov/snp/${rsid}' target='_blank'>${rsid}</a>`
          )
          .join(',');

        return {
          chr: entry.chromosome,
          range: {
            start: entry.start,
            end: entry.end,
          },
          ref: entry.reference,
          alt: entry.alternate,
          type: 'snp',
          name: rsids.join(','),
          representation: representation,
        };
      })
      .filter((snp: SNP) => snp.name);

    return { snps, totalCount };
  } catch (error) {
    console.error('Error fetching SNPs from EVA:', error);
    return { snps: [], totalCount: 0 };
  }
}

/**
 * Fetches all SNPs in a genomic range by making multiple paginated requests
 * @param species The EVA species identifier
 * @param chr Chromosome
 * @param start Start position
 * @param end End position
 * @param onProgress Optional callback function to report progress
 * @returns Array of all SNPs in the range
 */
export async function fetchAllSNPsInRange(
  species: string,
  chr: string,
  start: number,
  end: number,
  onProgress?: (current: number, total: number, snps: SNP[]) => void
): Promise<SNP[]> {
  const batchSize = 5000; // Reasonable batch size below the 10000 limit
  let skip = 0;
  let allSNPs: SNP[] = [];
  let totalCount = 0;
  let hasMore = true;

  // EVA API rate limits to 5 requests per second
  const rateLimit = 250; // 250ms delay between requests (4 req/sec to be safe)

  try {
    // Get first batch and determine total count
    const firstBatch = await fetchSNPsInRange(
      species,
      chr,
      start,
      end,
      batchSize,
      skip
    );
    allSNPs = firstBatch.snps;
    totalCount = firstBatch.totalCount;
    skip += batchSize;

    // Report progress if callback provided
    if (onProgress) {
      onProgress(allSNPs.length, totalCount, [...allSNPs]);
    }

    // If we have more results to fetch
    while (skip < totalCount) {
      // Respect rate limiting
      await new Promise((resolve) => setTimeout(resolve, rateLimit));

      const batch = await fetchSNPsInRange(
        species,
        chr,
        start,
        end,
        batchSize,
        skip
      );
      allSNPs = [...allSNPs, ...batch.snps];
      skip += batchSize;

      // Report progress if callback provided
      if (onProgress) {
        onProgress(allSNPs.length, totalCount, batch.snps);
      }
    }

    return allSNPs;
  } catch (error) {
    console.error('Error fetching all SNPs:', error);
    return allSNPs; // Return what we've got so far
  }
}

/**
 * Checks if an rsID exists in EVA
 * @param species The EVA species identifier
 * @param rsid The rsID to check
 * @returns Boolean indicating if the SNP exists
 */
export async function checkIfExists(
  species: string,
  rsid: string
): Promise<boolean> {
  if (!rsid.startsWith('rs')) {
    return false;
  }

  try {
    const response = await fetch(
      `https://www.ebi.ac.uk/eva/webservices/rest/v1/variants/${rsid}/exists?species=${species}`
    );

    if (!response.ok) {
      throw new Error(`EVA API error: ${response.status}`);
    }

    const data = await response.json();
    return !!data?.response?.[0]?.result?.[0];
  } catch (error) {
    console.error('Error checking if SNP exists:', error);
    return false;
  }
}

/**
 * Fetches detailed information for a specific SNP by rsID
 * @param species The EVA species identifier
 * @param rsid The rsID to fetch details for
 * @returns SNP details
 */
export async function fetchSNPDetails(
  species: string,
  rsid: string
): Promise<SNP | null> {
  try {
    const response = await fetch(
      `https://www.ebi.ac.uk/eva/webservices/rest/v1/variants/${rsid}/info?species=${species}`
    );

    if (!response.ok) {
      throw new Error(`EVA API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.response?.[0]?.result?.[0]) {
      return null;
    }

    const result = data.response[0].result[0];

    return {
      chr: result.chromosome,
      range: {
        start: result.start,
        end: result.end,
      },
      ref: result.reference,
      alt: result.alternate,
      name: rsid,
      type: 'snp',
    };
  } catch (error) {
    console.error('Error fetching SNP details:', error);
    return null;
  }
}
