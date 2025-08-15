import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementTrackerComponent } from './element-tracker.component';

describe('ElementTrackerComponent', () => {
  let component: ElementTrackerComponent;
  let fixture: ComponentFixture<ElementTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
