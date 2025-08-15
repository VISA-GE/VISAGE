import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugstOneComponent } from './drugst-one.component';

describe('DrugstOneComponent', () => {
  let component: DrugstOneComponent;
  let fixture: ComponentFixture<DrugstOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugstOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrugstOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
