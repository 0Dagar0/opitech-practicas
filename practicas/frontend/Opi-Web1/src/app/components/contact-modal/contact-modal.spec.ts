import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactModalComponent } from './contact-modal';

describe('ContactModalComponent', () => {
  let component: ContactModalComponent;
  let fixture: ComponentFixture<ContactModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
