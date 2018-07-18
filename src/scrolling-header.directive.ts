import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  NgZone
} from "@angular/core";
// Keep an eye on this. Should eventually be able to animate show/hide.
// https://github.com/apache/cordova-plugin-statusbar/pull/37
// import { StatusBar } from "@ionic-native/status-bar";

import { Platform, Content } from "ionic-angular";

@Directive({
  selector: "[scrollingHeader]"
})
export class ScrollingHeaderDirective
  implements AfterViewInit, OnDestroy {
  // TODO: Consider measuring the content to see if it's worth activating.
  // Or just leave it up to devs to decide which pages for which it's necessary.
  // Maybe reset with exportAs - http://stackoverflow.com/a/36345948/1341838
  // TODO: Handle screen resizes
  private headerHeight: number;
  private lastScrollTop: number = 0;
  private lastHeaderTop: number = 0;

  // I'm using this because I don't know when the different platforms decide
  // if StatusBar.isVisible is true/false; is it immediate or after animation?
  // It also prevents ongoing console warnings about Cordova.
  private isStatusBarShowing: boolean = true;

  private pauseForBarAnimation: boolean = false;
  private pauseForBarDuration = 500;

  // private savedConDim;
  // render vars so we aren't scoping new ones each time
  private scrollTop = 0;
  private contentHeight = 0;
  private scrollHeight = 0;
  private scrollChange = 0;
  private pastBottom: boolean;
  private lastTopFloored = 0;

  /**
   * TODO: Some values to make a parallax effect
   */

  private showParallaxFactor = 0.7;
  private hideParallaxFactor = this.showParallaxFactor * 0.6;

  @Input("scrollingHeader") content: Content;
  //TODO: To cache scroll element from the content
  contentScrollElement: HTMLElement;
  //TODO: To cache tabbar and it's placement from the content
  tabbarElement: HTMLElement;
  tabbarPlacement: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private zone: NgZone,
    public plt: Platform
    // private statusBar: StatusBar
  ) { }
  ngAfterViewInit() {
    if (this.content) {
      this.startBindings();
      // this.startBindings_old(); 
    } else {
      console.error("No content is provided for ionic scroling header!")
    }
  }
  startBindings() {

    //init for tabs
    if (this.content._tabs) {
      this.tabbarPlacement = this.content._tabs["tabsPlacement"];
      this.tabbarElement = this.content._tabs["_tabbar"].nativeElement;
    }

    //Cache the scroll element and tabbar inside our variables
    this.contentScrollElement = this.content.getScrollElement();

    // Call to init values.
    this.resize();

    // TODO: init the scroll view and enable scroll events

    this.zone.runOutsideAngular(() => {
      this.content.ionScroll.subscribe((ev) => {
        this.onPageScroll(event);
        this.render(ev);
      });
    });
  }
  ngOnDestroy() {
  }

  resize() {
    // clientHeight and offsetHeight ignore bottom shadow in measurment
    // but if tab is placed above , no need to consider the box shadows
    if (this.tabbarPlacement == "top") {
      this.headerHeight = this.el.nativeElement.offsetHeight;
    } else {
      this.headerHeight = this.el.nativeElement.scrollHeight;
    }
    //init content for translation
    // this.renderer.setStyle(this.contentScrollElement,"bottom",`${-this.headerHeight}px`);
  }

  render(ev) {
    ev.domWrite(() => {
      this.calculateRender(null);
    })
  }

  get showingHeight(): number {
    return this.headerHeight - this.lastHeaderTop;
  }

  private onPageScroll(event) {
    this.scrollTop = event.target.scrollTop;
    this.contentHeight = event.target.clientHeight;
    this.scrollHeight = event.target.scrollHeight;
  }

  calculateRender(timestamp) {
    // Gotta be > 0 otherwise we aren't scrolling yet, or are rubberbanding.
    // If scrollTop and lastScrollTop are the same, we've stopped scrolling
    // and no need for calculations
    if (this.scrollTop >= 0 && this.scrollTop !== this.lastScrollTop) {
      // Obvious
      this.scrollChange = this.scrollTop - this.lastScrollTop;

      // Update for next loop
      this.lastScrollTop = this.scrollTop;

      // This is whether we are rubberbanding past the bottom
      this.pastBottom = this.contentHeight + this.scrollTop > this.scrollHeight;

      // GOING UP
      if (this.scrollChange > 0) {
        if (this.isStatusBarShowing && !this.pauseForBarAnimation) {
          // StatusBar.isVisible
          this.isStatusBarShowing = false;
          // this.statusBar.hide();
        }

        // Shrink the header with the slower hideParallaxFactor
        this.lastHeaderTop += this.scrollChange * this.hideParallaxFactor;

        // The header only moves offscreen as far as it is tall. That leaves
        // it ready to immediately scroll back when needed.
        if (this.lastHeaderTop >= this.headerHeight) {
          this.lastHeaderTop = this.headerHeight;
        }

        // GOING DOWN
      } else if (this.scrollChange < 0 && !this.pastBottom) {
        /**
         * The combination of scrollChange < 0 && !pastBottom has to do with
         * the return movement of the rubberbanding effect after you've scrolled
         * all the way to the bottom (UP), and after releasing the elastic
         * is bringing it back down. This allows you to reach the bottom, and
         * push the header away without it sneaking back.
         */

        // Is 40 the right height (for iOS)? If it shows too early it looks weird.
        // When animation is available, it will look better too.
        if (!this.isStatusBarShowing && this.showingHeight > 40) {
          // !StatusBar.isVisible
          if (!this.pauseForBarAnimation) {
            this.pauseForBarAnimation = true;
            this.isStatusBarShowing = true;
            // this.statusBar.show();

            setTimeout(() => {
              this.pauseForBarAnimation = false;
            }, this.pauseForBarDuration);
          }
        }

        // Reveal the header with the faster showParallaxFactor
        this.lastHeaderTop += this.scrollChange * this.showParallaxFactor;
        // The header can't go past (greater) zero. We should never see any
        // gaps above the header, even when rubberbanding.
        if (this.lastHeaderTop <= 0) {
          this.lastHeaderTop = 0;
        }

        // console.group(`\\/ Going DOWN \\/`);
        //   console.log(`scrollChange`, this.scrollChange);
        //   console.log(`scrollTop`, this.scrollTop);
        //   console.log(`lastTop`, this.lastHeaderTop);
        // console.groupEnd();
      } else {
        // prevented by scrollTop !== lastScrollTop above, shouldn't happen
        console.log("going NOWHERE", this.scrollChange, this.scrollTop);
        // cancelAnimationFrame?
      }

      // Use floor to prevent line flicker between ion-navbar & ion-toolbar.
      // this.lastTopFloored = Math.floor(this.lastHeaderTop);
      // Double tilde is a bitwize version of floor that is a touch faster:
      // https://youtu.be/O39OEPC20GM?t=859
      this.lastTopFloored = ~~this.lastHeaderTop;

      //Translate all the elements according to the lasttopfloored
      this.onTranslate(this.lastTopFloored);
    } else {
      // Don't do anything here since we are rubberbanding past the top.
    }
  }
  //TODO: to make the header stable after the scroll is finished
  //just to avoid the parts of the header being outside the container
  //even after the scroll is finished.
  // onScrollEnd() {
  //   while (this.lastTopFloored > 0 && this.lastTopFloored < this.headerHeight) {
  //     if (this.lastHeaderTop > this.headerHeight / 2) {
  //       this.lastHeaderTop++;
  //     } else {
  //       this.lastHeaderTop--;
  //     }
  //     this.lastTopFloored = ~~(this.lastHeaderTop* this.hideParallaxFactor);
  //     this.onTranslate(this.lastTopFloored);
  //   }
  // }

  //TODO: to translate all the elements
  /**
   *
   * @param lastTopFloored -scrolltop after applygin the parallax factor
   */
  onTranslate(lastTopFloored) {
    this.renderer.setStyle(
      this.el.nativeElement,
      this.plt.Css.transform,
      `translate3d(0, ${-lastTopFloored}px ,0)`
    );
    //TODO:to adjust our content with the header
    // this.renderer.setStyle(
    //   this.contentScrollElement,
    //   this.plt.Css.transform,
    //   `translate3d(0, ${-lastTopFloored}px ,0)`
    // );
    this.renderer.setStyle(
      this.contentScrollElement,
      "top",
      `${-lastTopFloored}px`
    );
    //TODO:to adjust our tab with the header
    if (this.tabbarPlacement == "top") {
      this.renderer.setStyle(
        this.tabbarElement,
        this.plt.Css.transform,
        `translate3d(0, ${-lastTopFloored}px ,0)`
      );
    }
  }
}
