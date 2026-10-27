import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarfieldComponent } from './starfield';

describe('StarfieldComponent', () => {
  let component: StarfieldComponent;
  let fixture: ComponentFixture<StarfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarfieldComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StarfieldComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
