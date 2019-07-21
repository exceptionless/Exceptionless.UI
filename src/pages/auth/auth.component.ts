import { Component } from '@angular/core';

@Component({
  template: 'aaa, <router-outlet></router-outlet>'
})
export class AuthPageComponent {
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('sssss');
  }
}
