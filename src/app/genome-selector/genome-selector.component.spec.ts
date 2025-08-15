import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenomeSelectorComponent } from './genome-selector.component';

describe('GenomeSelectorComponent', () => {
  let component: GenomeSelectorComponent;
  let fixture: ComponentFixture<GenomeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenomeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenomeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
