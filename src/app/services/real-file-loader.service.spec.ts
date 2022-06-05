import { TestBed } from '@angular/core/testing';

import { RealFileLoaderService } from './real-file-loader.service';

describe('RealFileLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RealFileLoaderService = TestBed.get(RealFileLoaderService);
    expect(service).toBeTruthy();
  });
});
