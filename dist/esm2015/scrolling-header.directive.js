/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Directive, ElementRef, Input, Renderer2, NgZone } from "@angular/core";
import { Platform, Content } from "ionic-angular";
export class ScrollingHeaderDirective {
    /**
     * @param {?} el
     * @param {?} renderer
     * @param {?} zone
     * @param {?} plt
     */
    constructor(el, renderer, zone, plt) {
        this.el = el;
        this.renderer = renderer;
        this.zone = zone;
        this.plt = plt;
        this.lastScrollTop = 0;
        this.lastHeaderTop = 0;
        this.isStatusBarShowing = true;
        this.pauseForBarAnimation = false;
        this.pauseForBarDuration = 500;
        this.scrollTop = 0;
        this.contentHeight = 0;
        this.scrollHeight = 0;
        this.scrollChange = 0;
        this.lastTopFloored = 0;
        /**
         * TODO: Some values to make a parallax effect
         */
        this.showParallaxFactor = 0.7;
        this.hideParallaxFactor = this.showParallaxFactor * 0.6;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (this.content) {
            this.startBindings();
            // this.startBindings_old();
        }
        else {
            console.error("No content is provided for ionic scroling header!");
        }
    }
    /**
     * @return {?}
     */
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
    /**
     * @return {?}
     */
    ngOnDestroy() {
    }
    /**
     * @return {?}
     */
    resize() {
        // clientHeight and offsetHeight ignore bottom shadow in measurment
        // but if tab is placed above , no need to consider the box shadows
        if (this.tabbarPlacement == "top") {
            this.headerHeight = this.el.nativeElement.offsetHeight;
        }
        else {
            this.headerHeight = this.el.nativeElement.scrollHeight;
        }
        //init content for translation
        // this.renderer.setStyle(this.contentScrollElement,"bottom",`${-this.headerHeight}px`);
    }
    /**
     * @param {?} ev
     * @return {?}
     */
    render(ev) {
        ev.domWrite(() => {
            this.calculateRender(null);
        });
    }
    /**
     * @return {?}
     */
    get showingHeight() {
        return this.headerHeight - this.lastHeaderTop;
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onPageScroll(event) {
        this.scrollTop = event.target.scrollTop;
        this.contentHeight = event.target.clientHeight;
        this.scrollHeight = event.target.scrollHeight;
    }
    /**
     * @param {?} timestamp
     * @return {?}
     */
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
            }
            else if (this.scrollChange < 0 && !this.pastBottom) {
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
            }
            else {
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
        }
        else {
            // Don't do anything here since we are rubberbanding past the top.
        }
    }
    /**
     *
     * @param {?} lastTopFloored -scrolltop after applygin the parallax factor
     * @return {?}
     */
    onTranslate(lastTopFloored) {
        this.renderer.setStyle(this.el.nativeElement, this.plt.Css.transform, `translate3d(0, ${-lastTopFloored}px ,0)`);
        //TODO:to adjust our content with the header
        // this.renderer.setStyle(
        //   this.contentScrollElement,
        //   this.plt.Css.transform,
        //   `translate3d(0, ${-lastTopFloored}px ,0)`
        // );
        this.renderer.setStyle(this.contentScrollElement, "top", `${-lastTopFloored}px`);
        //TODO:to adjust our tab with the header
        if (this.tabbarPlacement == "top") {
            this.renderer.setStyle(this.tabbarElement, this.plt.Css.transform, `translate3d(0, ${-lastTopFloored}px ,0)`);
        }
    }
}
ScrollingHeaderDirective.decorators = [
    { type: Directive, args: [{
                selector: "[scrollingHeader]"
            },] },
];
/** @nocollapse */
ScrollingHeaderDirective.ctorParameters = () => [
    { type: ElementRef, },
    { type: Renderer2, },
    { type: NgZone, },
    { type: Platform, },
];
ScrollingHeaderDirective.propDecorators = {
    "content": [{ type: Input, args: ["scrollingHeader",] },],
};
function ScrollingHeaderDirective_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    ScrollingHeaderDirective.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    ScrollingHeaderDirective.ctorParameters;
    /** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */
    ScrollingHeaderDirective.propDecorators;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.headerHeight;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.lastScrollTop;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.lastHeaderTop;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.isStatusBarShowing;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.pauseForBarAnimation;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.pauseForBarDuration;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.scrollTop;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.contentHeight;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.scrollHeight;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.scrollChange;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.pastBottom;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.lastTopFloored;
    /**
     * TODO: Some values to make a parallax effect
     * @type {?}
     */
    ScrollingHeaderDirective.prototype.showParallaxFactor;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.hideParallaxFactor;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.content;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.contentScrollElement;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.tabbarElement;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.tabbarPlacement;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.el;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.renderer;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.zone;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.plt;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsaW5nLWhlYWRlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYy1zY3JvbGxpbmctaGVhZGVyLyIsInNvdXJjZXMiOlsic2Nyb2xsaW5nLWhlYWRlci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLEtBQUssRUFDTCxTQUFTLEVBR1QsTUFBTSxFQUNQLE1BQU0sZUFBZSxDQUFDO0FBS3ZCLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBS2xELE1BQU07Ozs7Ozs7SUF5Q0osWUFDVSxJQUNBLFVBQ0EsTUFDRDtRQUhDLE9BQUUsR0FBRixFQUFFO1FBQ0YsYUFBUSxHQUFSLFFBQVE7UUFDUixTQUFJLEdBQUosSUFBSTtRQUNMLFFBQUcsR0FBSCxHQUFHOzZCQXRDb0IsQ0FBQzs2QkFDRCxDQUFDO2tDQUtLLElBQUk7b0NBRUYsS0FBSzttQ0FDZixHQUFHO3lCQUliLENBQUM7NkJBQ0csQ0FBQzs0QkFDRixDQUFDOzRCQUNELENBQUM7OEJBRUMsQ0FBQzs7OztrQ0FNRyxHQUFHO2tDQUNILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxHQUFHO0tBZXJEOzs7O0lBQ0wsZUFBZTtRQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7U0FFdEI7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQTtTQUNuRTtLQUNGOzs7O0lBQ0QsYUFBYTs7UUFHWCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztTQUNsRTs7UUFHRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztRQUc1RCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O1FBSWQsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDakIsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDO0tBQ0o7Ozs7SUFDRCxXQUFXO0tBQ1Y7Ozs7SUFFRCxNQUFNOzs7UUFHSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUM7U0FDeEQ7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDO1NBQ3hEOzs7S0FHRjs7Ozs7SUFFRCxNQUFNLENBQUMsRUFBRTtRQUNQLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QixDQUFDLENBQUE7S0FDSDs7OztJQUVELElBQUksYUFBYTtRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7S0FDL0M7Ozs7O0lBRU8sWUFBWSxDQUFDLEtBQUs7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUN4QyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQy9DLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7Ozs7OztJQUdoRCxlQUFlLENBQUMsU0FBUzs7OztRQUl2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOztZQUVqRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQzs7WUFHeEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDOztZQUdwQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDOztZQUcxRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7O29CQUUxRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDOztpQkFFakM7O2dCQUdELElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7OztnQkFJbEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2lCQUN4Qzs7YUFHRjtZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7O2dCQVdyRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7O29CQUV4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7d0JBQy9CLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7d0JBQ2pDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7O3dCQUcvQixVQUFVLENBQUMsR0FBRyxFQUFFOzRCQUNkLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7eUJBQ25DLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7cUJBQzlCO2lCQUNGOztnQkFHRCxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDOzs7Z0JBR2xFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7aUJBQ3hCOzs7Ozs7YUFPRjtZQUFDLElBQUksQ0FBQyxDQUFDOztnQkFFTixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7YUFFakU7Ozs7O1lBTUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQzs7WUFHM0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDdkM7UUFBQyxJQUFJLENBQUMsQ0FBQzs7U0FFUDtLQUNGOzs7Ozs7SUFxQkQsV0FBVyxDQUFDLGNBQWM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQ3RCLGtCQUFrQixDQUFDLGNBQWMsUUFBUSxDQUMxQyxDQUFDOzs7Ozs7O1FBT0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxvQkFBb0IsRUFDekIsS0FBSyxFQUNMLEdBQUcsQ0FBQyxjQUFjLElBQUksQ0FDdkIsQ0FBQzs7UUFFRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxhQUFhLEVBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFDdEIsa0JBQWtCLENBQUMsY0FBYyxRQUFRLENBQzFDLENBQUM7U0FDSDtLQUNGOzs7WUFyUEYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxtQkFBbUI7YUFDOUI7Ozs7WUFmQyxVQUFVO1lBRVYsU0FBUztZQUdULE1BQU07WUFNQyxRQUFROzs7d0JBdUNkLEtBQUssU0FBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIElucHV0LFxyXG4gIFJlbmRlcmVyMixcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIE9uRGVzdHJveSxcclxuICBOZ1pvbmVcclxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG4vLyBLZWVwIGFuIGV5ZSBvbiB0aGlzLiBTaG91bGQgZXZlbnR1YWxseSBiZSBhYmxlIHRvIGFuaW1hdGUgc2hvdy9oaWRlLlxyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYXBhY2hlL2NvcmRvdmEtcGx1Z2luLXN0YXR1c2Jhci9wdWxsLzM3XHJcbi8vIGltcG9ydCB7IFN0YXR1c0JhciB9IGZyb20gXCJAaW9uaWMtbmF0aXZlL3N0YXR1cy1iYXJcIjtcclxuXHJcbmltcG9ydCB7IFBsYXRmb3JtLCBDb250ZW50IH0gZnJvbSBcImlvbmljLWFuZ3VsYXJcIjtcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiBcIltzY3JvbGxpbmdIZWFkZXJdXCJcclxufSlcclxuZXhwb3J0IGNsYXNzIFNjcm9sbGluZ0hlYWRlckRpcmVjdGl2ZVxyXG4gIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcclxuICAvLyBUT0RPOiBDb25zaWRlciBtZWFzdXJpbmcgdGhlIGNvbnRlbnQgdG8gc2VlIGlmIGl0J3Mgd29ydGggYWN0aXZhdGluZy5cclxuICAvLyBPciBqdXN0IGxlYXZlIGl0IHVwIHRvIGRldnMgdG8gZGVjaWRlIHdoaWNoIHBhZ2VzIGZvciB3aGljaCBpdCdzIG5lY2Vzc2FyeS5cclxuICAvLyBNYXliZSByZXNldCB3aXRoIGV4cG9ydEFzIC0gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzYzNDU5NDgvMTM0MTgzOFxyXG4gIC8vIFRPRE86IEhhbmRsZSBzY3JlZW4gcmVzaXplc1xyXG4gIHByaXZhdGUgaGVhZGVySGVpZ2h0OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBsYXN0U2Nyb2xsVG9wOiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgbGFzdEhlYWRlclRvcDogbnVtYmVyID0gMDtcclxuXHJcbiAgLy8gSSdtIHVzaW5nIHRoaXMgYmVjYXVzZSBJIGRvbid0IGtub3cgd2hlbiB0aGUgZGlmZmVyZW50IHBsYXRmb3JtcyBkZWNpZGVcclxuICAvLyBpZiBTdGF0dXNCYXIuaXNWaXNpYmxlIGlzIHRydWUvZmFsc2U7IGlzIGl0IGltbWVkaWF0ZSBvciBhZnRlciBhbmltYXRpb24/XHJcbiAgLy8gSXQgYWxzbyBwcmV2ZW50cyBvbmdvaW5nIGNvbnNvbGUgd2FybmluZ3MgYWJvdXQgQ29yZG92YS5cclxuICBwcml2YXRlIGlzU3RhdHVzQmFyU2hvd2luZzogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIHByaXZhdGUgcGF1c2VGb3JCYXJBbmltYXRpb246IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwcml2YXRlIHBhdXNlRm9yQmFyRHVyYXRpb24gPSA1MDA7XHJcblxyXG4gIC8vIHByaXZhdGUgc2F2ZWRDb25EaW07XHJcbiAgLy8gcmVuZGVyIHZhcnMgc28gd2UgYXJlbid0IHNjb3BpbmcgbmV3IG9uZXMgZWFjaCB0aW1lXHJcbiAgcHJpdmF0ZSBzY3JvbGxUb3AgPSAwO1xyXG4gIHByaXZhdGUgY29udGVudEhlaWdodCA9IDA7XHJcbiAgcHJpdmF0ZSBzY3JvbGxIZWlnaHQgPSAwO1xyXG4gIHByaXZhdGUgc2Nyb2xsQ2hhbmdlID0gMDtcclxuICBwcml2YXRlIHBhc3RCb3R0b206IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBsYXN0VG9wRmxvb3JlZCA9IDA7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRPRE86IFNvbWUgdmFsdWVzIHRvIG1ha2UgYSBwYXJhbGxheCBlZmZlY3RcclxuICAgKi9cclxuXHJcbiAgcHJpdmF0ZSBzaG93UGFyYWxsYXhGYWN0b3IgPSAwLjc7XHJcbiAgcHJpdmF0ZSBoaWRlUGFyYWxsYXhGYWN0b3IgPSB0aGlzLnNob3dQYXJhbGxheEZhY3RvciAqIDAuNjtcclxuXHJcbiAgQElucHV0KFwic2Nyb2xsaW5nSGVhZGVyXCIpIGNvbnRlbnQ6IENvbnRlbnQ7XHJcbiAgLy9UT0RPOiBUbyBjYWNoZSBzY3JvbGwgZWxlbWVudCBmcm9tIHRoZSBjb250ZW50XHJcbiAgY29udGVudFNjcm9sbEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gIC8vVE9ETzogVG8gY2FjaGUgdGFiYmFyIGFuZCBpdCdzIHBsYWNlbWVudCBmcm9tIHRoZSBjb250ZW50XHJcbiAgdGFiYmFyRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgdGFiYmFyUGxhY2VtZW50OiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBlbDogRWxlbWVudFJlZixcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgIHByaXZhdGUgem9uZTogTmdab25lLFxyXG4gICAgcHVibGljIHBsdDogUGxhdGZvcm1cclxuICAgIC8vIHByaXZhdGUgc3RhdHVzQmFyOiBTdGF0dXNCYXJcclxuICApIHsgfVxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgIGlmICh0aGlzLmNvbnRlbnQpIHtcclxuICAgICAgdGhpcy5zdGFydEJpbmRpbmdzKCk7XHJcbiAgICAgIC8vIHRoaXMuc3RhcnRCaW5kaW5nc19vbGQoKTsgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiTm8gY29udGVudCBpcyBwcm92aWRlZCBmb3IgaW9uaWMgc2Nyb2xpbmcgaGVhZGVyIVwiKVxyXG4gICAgfVxyXG4gIH1cclxuICBzdGFydEJpbmRpbmdzKCkge1xyXG5cclxuICAgIC8vaW5pdCBmb3IgdGFic1xyXG4gICAgaWYgKHRoaXMuY29udGVudC5fdGFicykge1xyXG4gICAgICB0aGlzLnRhYmJhclBsYWNlbWVudCA9IHRoaXMuY29udGVudC5fdGFic1tcInRhYnNQbGFjZW1lbnRcIl07XHJcbiAgICAgIHRoaXMudGFiYmFyRWxlbWVudCA9IHRoaXMuY29udGVudC5fdGFic1tcIl90YWJiYXJcIl0ubmF0aXZlRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvL0NhY2hlIHRoZSBzY3JvbGwgZWxlbWVudCBhbmQgdGFiYmFyIGluc2lkZSBvdXIgdmFyaWFibGVzXHJcbiAgICB0aGlzLmNvbnRlbnRTY3JvbGxFbGVtZW50ID0gdGhpcy5jb250ZW50LmdldFNjcm9sbEVsZW1lbnQoKTtcclxuXHJcbiAgICAvLyBDYWxsIHRvIGluaXQgdmFsdWVzLlxyXG4gICAgdGhpcy5yZXNpemUoKTtcclxuXHJcbiAgICAvLyBUT0RPOiBpbml0IHRoZSBzY3JvbGwgdmlldyBhbmQgZW5hYmxlIHNjcm9sbCBldmVudHNcclxuXHJcbiAgICB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICB0aGlzLmNvbnRlbnQuaW9uU2Nyb2xsLnN1YnNjcmliZSgoZXYpID0+IHtcclxuICAgICAgICB0aGlzLm9uUGFnZVNjcm9sbChldmVudCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoZXYpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICB9XHJcblxyXG4gIHJlc2l6ZSgpIHtcclxuICAgIC8vIGNsaWVudEhlaWdodCBhbmQgb2Zmc2V0SGVpZ2h0IGlnbm9yZSBib3R0b20gc2hhZG93IGluIG1lYXN1cm1lbnRcclxuICAgIC8vIGJ1dCBpZiB0YWIgaXMgcGxhY2VkIGFib3ZlICwgbm8gbmVlZCB0byBjb25zaWRlciB0aGUgYm94IHNoYWRvd3NcclxuICAgIGlmICh0aGlzLnRhYmJhclBsYWNlbWVudCA9PSBcInRvcFwiKSB7XHJcbiAgICAgIHRoaXMuaGVhZGVySGVpZ2h0ID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50Lm9mZnNldEhlaWdodDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaGVhZGVySGVpZ2h0ID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxuICAgIC8vaW5pdCBjb250ZW50IGZvciB0cmFuc2xhdGlvblxyXG4gICAgLy8gdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmNvbnRlbnRTY3JvbGxFbGVtZW50LFwiYm90dG9tXCIsYCR7LXRoaXMuaGVhZGVySGVpZ2h0fXB4YCk7XHJcbiAgfVxyXG5cclxuICByZW5kZXIoZXYpIHtcclxuICAgIGV2LmRvbVdyaXRlKCgpID0+IHtcclxuICAgICAgdGhpcy5jYWxjdWxhdGVSZW5kZXIobnVsbCk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZ2V0IHNob3dpbmdIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmhlYWRlckhlaWdodCAtIHRoaXMubGFzdEhlYWRlclRvcDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25QYWdlU2Nyb2xsKGV2ZW50KSB7XHJcbiAgICB0aGlzLnNjcm9sbFRvcCA9IGV2ZW50LnRhcmdldC5zY3JvbGxUb3A7XHJcbiAgICB0aGlzLmNvbnRlbnRIZWlnaHQgPSBldmVudC50YXJnZXQuY2xpZW50SGVpZ2h0O1xyXG4gICAgdGhpcy5zY3JvbGxIZWlnaHQgPSBldmVudC50YXJnZXQuc2Nyb2xsSGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgY2FsY3VsYXRlUmVuZGVyKHRpbWVzdGFtcCkge1xyXG4gICAgLy8gR290dGEgYmUgPiAwIG90aGVyd2lzZSB3ZSBhcmVuJ3Qgc2Nyb2xsaW5nIHlldCwgb3IgYXJlIHJ1YmJlcmJhbmRpbmcuXHJcbiAgICAvLyBJZiBzY3JvbGxUb3AgYW5kIGxhc3RTY3JvbGxUb3AgYXJlIHRoZSBzYW1lLCB3ZSd2ZSBzdG9wcGVkIHNjcm9sbGluZ1xyXG4gICAgLy8gYW5kIG5vIG5lZWQgZm9yIGNhbGN1bGF0aW9uc1xyXG4gICAgaWYgKHRoaXMuc2Nyb2xsVG9wID49IDAgJiYgdGhpcy5zY3JvbGxUb3AgIT09IHRoaXMubGFzdFNjcm9sbFRvcCkge1xyXG4gICAgICAvLyBPYnZpb3VzXHJcbiAgICAgIHRoaXMuc2Nyb2xsQ2hhbmdlID0gdGhpcy5zY3JvbGxUb3AgLSB0aGlzLmxhc3RTY3JvbGxUb3A7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgZm9yIG5leHQgbG9vcFxyXG4gICAgICB0aGlzLmxhc3RTY3JvbGxUb3AgPSB0aGlzLnNjcm9sbFRvcDtcclxuXHJcbiAgICAgIC8vIFRoaXMgaXMgd2hldGhlciB3ZSBhcmUgcnViYmVyYmFuZGluZyBwYXN0IHRoZSBib3R0b21cclxuICAgICAgdGhpcy5wYXN0Qm90dG9tID0gdGhpcy5jb250ZW50SGVpZ2h0ICsgdGhpcy5zY3JvbGxUb3AgPiB0aGlzLnNjcm9sbEhlaWdodDtcclxuXHJcbiAgICAgIC8vIEdPSU5HIFVQXHJcbiAgICAgIGlmICh0aGlzLnNjcm9sbENoYW5nZSA+IDApIHtcclxuICAgICAgICBpZiAodGhpcy5pc1N0YXR1c0JhclNob3dpbmcgJiYgIXRoaXMucGF1c2VGb3JCYXJBbmltYXRpb24pIHtcclxuICAgICAgICAgIC8vIFN0YXR1c0Jhci5pc1Zpc2libGVcclxuICAgICAgICAgIHRoaXMuaXNTdGF0dXNCYXJTaG93aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAvLyB0aGlzLnN0YXR1c0Jhci5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaHJpbmsgdGhlIGhlYWRlciB3aXRoIHRoZSBzbG93ZXIgaGlkZVBhcmFsbGF4RmFjdG9yXHJcbiAgICAgICAgdGhpcy5sYXN0SGVhZGVyVG9wICs9IHRoaXMuc2Nyb2xsQ2hhbmdlICogdGhpcy5oaWRlUGFyYWxsYXhGYWN0b3I7XHJcblxyXG4gICAgICAgIC8vIFRoZSBoZWFkZXIgb25seSBtb3ZlcyBvZmZzY3JlZW4gYXMgZmFyIGFzIGl0IGlzIHRhbGwuIFRoYXQgbGVhdmVzXHJcbiAgICAgICAgLy8gaXQgcmVhZHkgdG8gaW1tZWRpYXRlbHkgc2Nyb2xsIGJhY2sgd2hlbiBuZWVkZWQuXHJcbiAgICAgICAgaWYgKHRoaXMubGFzdEhlYWRlclRvcCA+PSB0aGlzLmhlYWRlckhlaWdodCkge1xyXG4gICAgICAgICAgdGhpcy5sYXN0SGVhZGVyVG9wID0gdGhpcy5oZWFkZXJIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHT0lORyBET1dOXHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zY3JvbGxDaGFuZ2UgPCAwICYmICF0aGlzLnBhc3RCb3R0b20pIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgY29tYmluYXRpb24gb2Ygc2Nyb2xsQ2hhbmdlIDwgMCAmJiAhcGFzdEJvdHRvbSBoYXMgdG8gZG8gd2l0aFxyXG4gICAgICAgICAqIHRoZSByZXR1cm4gbW92ZW1lbnQgb2YgdGhlIHJ1YmJlcmJhbmRpbmcgZWZmZWN0IGFmdGVyIHlvdSd2ZSBzY3JvbGxlZFxyXG4gICAgICAgICAqIGFsbCB0aGUgd2F5IHRvIHRoZSBib3R0b20gKFVQKSwgYW5kIGFmdGVyIHJlbGVhc2luZyB0aGUgZWxhc3RpY1xyXG4gICAgICAgICAqIGlzIGJyaW5naW5nIGl0IGJhY2sgZG93bi4gVGhpcyBhbGxvd3MgeW91IHRvIHJlYWNoIHRoZSBib3R0b20sIGFuZFxyXG4gICAgICAgICAqIHB1c2ggdGhlIGhlYWRlciBhd2F5IHdpdGhvdXQgaXQgc25lYWtpbmcgYmFjay5cclxuICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgLy8gSXMgNDAgdGhlIHJpZ2h0IGhlaWdodCAoZm9yIGlPUyk/IElmIGl0IHNob3dzIHRvbyBlYXJseSBpdCBsb29rcyB3ZWlyZC5cclxuICAgICAgICAvLyBXaGVuIGFuaW1hdGlvbiBpcyBhdmFpbGFibGUsIGl0IHdpbGwgbG9vayBiZXR0ZXIgdG9vLlxyXG4gICAgICAgIGlmICghdGhpcy5pc1N0YXR1c0JhclNob3dpbmcgJiYgdGhpcy5zaG93aW5nSGVpZ2h0ID4gNDApIHtcclxuICAgICAgICAgIC8vICFTdGF0dXNCYXIuaXNWaXNpYmxlXHJcbiAgICAgICAgICBpZiAoIXRoaXMucGF1c2VGb3JCYXJBbmltYXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5wYXVzZUZvckJhckFuaW1hdGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTdGF0dXNCYXJTaG93aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gdGhpcy5zdGF0dXNCYXIuc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wYXVzZUZvckJhckFuaW1hdGlvbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9LCB0aGlzLnBhdXNlRm9yQmFyRHVyYXRpb24pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmV2ZWFsIHRoZSBoZWFkZXIgd2l0aCB0aGUgZmFzdGVyIHNob3dQYXJhbGxheEZhY3RvclxyXG4gICAgICAgIHRoaXMubGFzdEhlYWRlclRvcCArPSB0aGlzLnNjcm9sbENoYW5nZSAqIHRoaXMuc2hvd1BhcmFsbGF4RmFjdG9yO1xyXG4gICAgICAgIC8vIFRoZSBoZWFkZXIgY2FuJ3QgZ28gcGFzdCAoZ3JlYXRlcikgemVyby4gV2Ugc2hvdWxkIG5ldmVyIHNlZSBhbnlcclxuICAgICAgICAvLyBnYXBzIGFib3ZlIHRoZSBoZWFkZXIsIGV2ZW4gd2hlbiBydWJiZXJiYW5kaW5nLlxyXG4gICAgICAgIGlmICh0aGlzLmxhc3RIZWFkZXJUb3AgPD0gMCkge1xyXG4gICAgICAgICAgdGhpcy5sYXN0SGVhZGVyVG9wID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUuZ3JvdXAoYFxcXFwvIEdvaW5nIERPV04gXFxcXC9gKTtcclxuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGBzY3JvbGxDaGFuZ2VgLCB0aGlzLnNjcm9sbENoYW5nZSk7XHJcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhgc2Nyb2xsVG9wYCwgdGhpcy5zY3JvbGxUb3ApO1xyXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coYGxhc3RUb3BgLCB0aGlzLmxhc3RIZWFkZXJUb3ApO1xyXG4gICAgICAgIC8vIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBwcmV2ZW50ZWQgYnkgc2Nyb2xsVG9wICE9PSBsYXN0U2Nyb2xsVG9wIGFib3ZlLCBzaG91bGRuJ3QgaGFwcGVuXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJnb2luZyBOT1dIRVJFXCIsIHRoaXMuc2Nyb2xsQ2hhbmdlLCB0aGlzLnNjcm9sbFRvcCk7XHJcbiAgICAgICAgLy8gY2FuY2VsQW5pbWF0aW9uRnJhbWU/XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVzZSBmbG9vciB0byBwcmV2ZW50IGxpbmUgZmxpY2tlciBiZXR3ZWVuIGlvbi1uYXZiYXIgJiBpb24tdG9vbGJhci5cclxuICAgICAgLy8gdGhpcy5sYXN0VG9wRmxvb3JlZCA9IE1hdGguZmxvb3IodGhpcy5sYXN0SGVhZGVyVG9wKTtcclxuICAgICAgLy8gRG91YmxlIHRpbGRlIGlzIGEgYml0d2l6ZSB2ZXJzaW9uIG9mIGZsb29yIHRoYXQgaXMgYSB0b3VjaCBmYXN0ZXI6XHJcbiAgICAgIC8vIGh0dHBzOi8veW91dHUuYmUvTzM5T0VQQzIwR00/dD04NTlcclxuICAgICAgdGhpcy5sYXN0VG9wRmxvb3JlZCA9IH5+dGhpcy5sYXN0SGVhZGVyVG9wO1xyXG5cclxuICAgICAgLy9UcmFuc2xhdGUgYWxsIHRoZSBlbGVtZW50cyBhY2NvcmRpbmcgdG8gdGhlIGxhc3R0b3BmbG9vcmVkXHJcbiAgICAgIHRoaXMub25UcmFuc2xhdGUodGhpcy5sYXN0VG9wRmxvb3JlZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBEb24ndCBkbyBhbnl0aGluZyBoZXJlIHNpbmNlIHdlIGFyZSBydWJiZXJiYW5kaW5nIHBhc3QgdGhlIHRvcC5cclxuICAgIH1cclxuICB9XHJcbiAgLy9UT0RPOiB0byBtYWtlIHRoZSBoZWFkZXIgc3RhYmxlIGFmdGVyIHRoZSBzY3JvbGwgaXMgZmluaXNoZWRcclxuICAvL2p1c3QgdG8gYXZvaWQgdGhlIHBhcnRzIG9mIHRoZSBoZWFkZXIgYmVpbmcgb3V0c2lkZSB0aGUgY29udGFpbmVyXHJcbiAgLy9ldmVuIGFmdGVyIHRoZSBzY3JvbGwgaXMgZmluaXNoZWQuXHJcbiAgLy8gb25TY3JvbGxFbmQoKSB7XHJcbiAgLy8gICB3aGlsZSAodGhpcy5sYXN0VG9wRmxvb3JlZCA+IDAgJiYgdGhpcy5sYXN0VG9wRmxvb3JlZCA8IHRoaXMuaGVhZGVySGVpZ2h0KSB7XHJcbiAgLy8gICAgIGlmICh0aGlzLmxhc3RIZWFkZXJUb3AgPiB0aGlzLmhlYWRlckhlaWdodCAvIDIpIHtcclxuICAvLyAgICAgICB0aGlzLmxhc3RIZWFkZXJUb3ArKztcclxuICAvLyAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICB0aGlzLmxhc3RIZWFkZXJUb3AtLTtcclxuICAvLyAgICAgfVxyXG4gIC8vICAgICB0aGlzLmxhc3RUb3BGbG9vcmVkID0gfn4odGhpcy5sYXN0SGVhZGVyVG9wKiB0aGlzLmhpZGVQYXJhbGxheEZhY3Rvcik7XHJcbiAgLy8gICAgIHRoaXMub25UcmFuc2xhdGUodGhpcy5sYXN0VG9wRmxvb3JlZCk7XHJcbiAgLy8gICB9XHJcbiAgLy8gfVxyXG5cclxuICAvL1RPRE86IHRvIHRyYW5zbGF0ZSBhbGwgdGhlIGVsZW1lbnRzXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbGFzdFRvcEZsb29yZWQgLXNjcm9sbHRvcCBhZnRlciBhcHBseWdpbiB0aGUgcGFyYWxsYXggZmFjdG9yXHJcbiAgICovXHJcbiAgb25UcmFuc2xhdGUobGFzdFRvcEZsb29yZWQpIHtcclxuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudCxcclxuICAgICAgdGhpcy5wbHQuQ3NzLnRyYW5zZm9ybSxcclxuICAgICAgYHRyYW5zbGF0ZTNkKDAsICR7LWxhc3RUb3BGbG9vcmVkfXB4ICwwKWBcclxuICAgICk7XHJcbiAgICAvL1RPRE86dG8gYWRqdXN0IG91ciBjb250ZW50IHdpdGggdGhlIGhlYWRlclxyXG4gICAgLy8gdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgIC8vICAgdGhpcy5jb250ZW50U2Nyb2xsRWxlbWVudCxcclxuICAgIC8vICAgdGhpcy5wbHQuQ3NzLnRyYW5zZm9ybSxcclxuICAgIC8vICAgYHRyYW5zbGF0ZTNkKDAsICR7LWxhc3RUb3BGbG9vcmVkfXB4ICwwKWBcclxuICAgIC8vICk7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKFxyXG4gICAgICB0aGlzLmNvbnRlbnRTY3JvbGxFbGVtZW50LFxyXG4gICAgICBcInRvcFwiLFxyXG4gICAgICBgJHstbGFzdFRvcEZsb29yZWR9cHhgXHJcbiAgICApO1xyXG4gICAgLy9UT0RPOnRvIGFkanVzdCBvdXIgdGFiIHdpdGggdGhlIGhlYWRlclxyXG4gICAgaWYgKHRoaXMudGFiYmFyUGxhY2VtZW50ID09IFwidG9wXCIpIHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgICAgICB0aGlzLnRhYmJhckVsZW1lbnQsXHJcbiAgICAgICAgdGhpcy5wbHQuQ3NzLnRyYW5zZm9ybSxcclxuICAgICAgICBgdHJhbnNsYXRlM2QoMCwgJHstbGFzdFRvcEZsb29yZWR9cHggLDApYFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=