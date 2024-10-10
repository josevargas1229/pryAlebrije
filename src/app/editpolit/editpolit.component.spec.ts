import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditpolitComponent } from './editpolit.component';

describe('EditpolitComponent', () => {
  let component: EditpolitComponent;
  let fixture: ComponentFixture<EditpolitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditpolitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditpolitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
