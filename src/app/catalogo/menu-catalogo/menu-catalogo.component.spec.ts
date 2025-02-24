import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCatalogoComponent } from './menu-catalogo.component';

describe('MenuCatalogoComponent', () => {
  let component: MenuCatalogoComponent;
  let fixture: ComponentFixture<MenuCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
