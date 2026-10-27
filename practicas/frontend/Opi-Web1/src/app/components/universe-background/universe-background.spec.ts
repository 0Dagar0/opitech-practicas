import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniverseBackgroundComponent } from './universe-background';

describe('UniverseBackgroundComponent', () => {
  let component: UniverseBackgroundComponent;
  let fixture: ComponentFixture<UniverseBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniverseBackgroundComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UniverseBackgroundComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
