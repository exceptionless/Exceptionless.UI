import { LayoutModule as CdkLayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { COMPONENTS } from './components';
import { MAT_MODULES } from './material-modules';

@NgModule({
  imports: [CommonModule, RouterModule, FlexLayoutModule, CdkLayoutModule, ...MAT_MODULES],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS]
})
export class LayoutModule {}
