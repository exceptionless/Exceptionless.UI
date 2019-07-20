import { NgModule } from '@angular/core';
import { AppCommonModule } from 'src/shared/common/common.module';
import { AuthPageComponent } from './auth.component';

@NgModule({
  imports: [AppCommonModule.withProviders()],
  declarations: [AuthPageComponent]
})
export class AuthPageModule {}
