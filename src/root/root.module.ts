import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RootComponent } from './root.component';
import { APP_ROUTES } from './root.routing';

@NgModule({
  imports: [BrowserModule, RouterModule.forRoot(APP_ROUTES)],
  declarations: [RootComponent],
  bootstrap: [RootComponent]
})
export class RootModule {}
