import {NgModule } from '@angular/core';
import { ScrollingHeaderDirective } from './scrolling-header.directive';
export * from "./scrolling-header.directive";
@NgModule({
  declarations: [
    ScrollingHeaderDirective
  ],
  exports:[
    ScrollingHeaderDirective
  ]
})
export class ScrollingHeaderModule {}
