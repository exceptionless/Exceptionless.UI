import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { StateStream } from '@yag/rxjs-utils';
import { Observable } from 'rxjs';

export type ThemeName = 'light' | 'dark';

@Injectable()
export class ThemeService {
  private renderer: Renderer2;
  private _light: boolean = true;

  private _theme: StateStream<ThemeName> = new StateStream('light');
  readonly theme$: Observable<ThemeName> = this._theme.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document, rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  getTheme(): ThemeName {
    return this._light ? 'light' : 'dark';
  }

  setTheme(theme: ThemeName): void {
    this._light = 'light' === theme;

    this.renderer.removeClass(this.document.body, 'app-theme-light');
    this.renderer.removeClass(this.document.body, 'app-theme-dark');
    this.renderer.addClass(this.document.body, 'app-theme-' + this.getTheme());

    this._theme.next(theme);
  }

  toggle(light?: boolean): void {
    this._light = arguments.length ? !!light : !this._light;
    this.setTheme(this._light ? 'light' : 'dark');
  }
}
