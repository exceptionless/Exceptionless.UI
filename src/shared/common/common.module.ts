import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SERVICES } from './services';

@NgModule({
  imports: [CommonModule]
})
export class AppCommonModule {
  withProviders(): ModuleWithProviders {
    return {
      ngModule: AppCommonModule,
      providers: [...SERVICES]
    };
  }
}
