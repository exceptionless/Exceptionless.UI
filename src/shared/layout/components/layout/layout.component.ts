import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeService } from '../../../common/services/theme/theme.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  constructor(public readonly themeService: ThemeService) {}
}
