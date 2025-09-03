import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementOverviewComponent } from './element-overview.component';

describe('ElementOverviewComponent', () => {
  let component: ElementOverviewComponent;
  let fixture: ComponentFixture<ElementOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
