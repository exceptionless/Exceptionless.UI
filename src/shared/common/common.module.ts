import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SERVICES } from './services';

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [CommonModule, RouterModule]
})
export class AppCommonModule {
  static withProviders(): ModuleWithProviders {
    return {
      ngModule: AppCommonModule,
      providers: [...SERVICES]
    };
  }
}
