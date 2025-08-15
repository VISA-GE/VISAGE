import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxIgvComponent } from './ngx-igv.component';

describe('NgxIgvComponent', () => {
  let component: NgxIgvComponent;
  let fixture: ComponentFixture<NgxIgvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxIgvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxIgvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
