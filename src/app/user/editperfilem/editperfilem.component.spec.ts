import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditperfilemComponent } from './editperfilem.component';

describe('EditperfilemComponent', () => {
  let component: EditperfilemComponent;
  let fixture: ComponentFixture<EditperfilemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditperfilemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditperfilemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
