import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { LayoutModule } from 'src/shared/layout/layout.module';
import { RootComponent } from './root.component';
import { APP_ROUTES } from './root.routing';

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(APP_ROUTES), LayoutModule],
  declarations: [RootComponent],
  bootstrap: [RootComponent]
})
export class RootModule {}
