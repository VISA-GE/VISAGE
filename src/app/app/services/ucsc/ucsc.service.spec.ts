import { TestBed } from '@angular/core/testing';

import { UcscService } from './ucsc.service';

describe('UcscService', () => {
  let service: UcscService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UcscService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
