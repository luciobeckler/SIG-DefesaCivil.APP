import { Component, OnInit } from '@angular/core';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [SideNavComponent],
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
