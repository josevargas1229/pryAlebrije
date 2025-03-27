import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGrowComponent } from './client-grow.component';

describe('ClientGrowComponent', () => {
  let component: ClientGrowComponent;
  let fixture: ComponentFixture<ClientGrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientGrowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientGrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
