import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EquipoComponent } from './equipo';

describe('EquipoComponent', () => {
  let component: EquipoComponent;
  let fixture: ComponentFixture<EquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(EquipoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
