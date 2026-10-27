import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroConstellationComponent } from './hero-constellation';

describe('HeroConstellationComponent', () => {
  let component: HeroConstellationComponent;
  let fixture: ComponentFixture<HeroConstellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroConstellationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroConstellationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
