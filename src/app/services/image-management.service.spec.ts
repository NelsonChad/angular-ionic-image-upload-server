import { TestBed } from '@angular/core/testing';

import { ImageManagementService } from './image-management.service';

describe('ImageManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageManagementService = TestBed.get(ImageManagementService);
    expect(service).toBeTruthy();
  });
});
