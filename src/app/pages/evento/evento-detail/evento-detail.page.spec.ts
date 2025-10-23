import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoDetailPage } from './evento-detail.page';

describe('EventoDetailPage', () => {
  let component: EventoDetailPage;
  let fixture: ComponentFixture<EventoDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
