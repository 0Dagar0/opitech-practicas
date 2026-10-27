import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactFloatComponent } from './contact-float';

describe('ContactFloatComponent', () => {
  let component: ContactFloatComponent;
  let fixture: ComponentFixture<ContactFloatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFloatComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFloatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
