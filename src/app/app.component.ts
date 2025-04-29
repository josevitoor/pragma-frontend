import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ConfigService } from 'tce-ng-lib';

@Component({
  selector: 'automation-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'automation-app';

  public constructor(private titleService: Title) {
    this.setTitle(ConfigService.getEnv().nomeSistema);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
