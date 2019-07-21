import { LayoutModule as CdkLayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppCommonModule } from '../common/common.module';
import { COMPONENTS } from './components';
import { MAT_MODULES } from './material-modules';

@NgModule({
  imports: [FlexLayoutModule, CdkLayoutModule, AppCommonModule.withProviders(), ...MAT_MODULES],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS]
})
export class LayoutModule {}
