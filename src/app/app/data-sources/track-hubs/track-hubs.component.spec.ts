import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackHubsComponent } from './track-hubs.component';

describe('TrackHubsComponent', () => {
  let component: TrackHubsComponent;
  let fixture: ComponentFixture<TrackHubsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackHubsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackHubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
