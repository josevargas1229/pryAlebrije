import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditerminosComponent } from './editerminos.component';

describe('EditerminosComponent', () => {
  let component: EditerminosComponent;
  let fixture: ComponentFixture<EditerminosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditerminosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditerminosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
