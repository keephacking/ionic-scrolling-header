/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Directive, ElementRef, Input, Renderer2, NgZone } from "@angular/core";
import { Platform, Content } from "ionic-angular";
var ScrollingHeaderDirective = /** @class */ (function () {
    function ScrollingHeaderDirective(el, renderer, zone, plt) {
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
    ScrollingHeaderDirective.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        if (this.content) {
            this.startBindings();
            // this.startBindings_old();
        }
        else {
            console.error("No content is provided for ionic scroling header!");
        }
    };
    /**
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.startBindings = /**
     * @return {?}
     */
    function () {
        var _this = this;
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
        this.zone.runOutsideAngular(function () {
            _this.content.ionScroll.subscribe(function (ev) {
                _this.onPageScroll(event);
                _this.render(ev);
            });
        });
    };
    /**
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
    };
    /**
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.resize = /**
     * @return {?}
     */
    function () {
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
    };
    /**
     * @param {?} ev
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.render = /**
     * @param {?} ev
     * @return {?}
     */
    function (ev) {
        var _this = this;
        ev.domWrite(function () {
            _this.calculateRender(null);
        });
    };
    Object.defineProperty(ScrollingHeaderDirective.prototype, "showingHeight", {
        get: /**
         * @return {?}
         */
        function () {
            return this.headerHeight - this.lastHeaderTop;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} event
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.onPageScroll = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.scrollTop = event.target.scrollTop;
        this.contentHeight = event.target.clientHeight;
        this.scrollHeight = event.target.scrollHeight;
    };
    /**
     * @param {?} timestamp
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.calculateRender = /**
     * @param {?} timestamp
     * @return {?}
     */
    function (timestamp) {
        var _this = this;
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
                        setTimeout(function () {
                            _this.pauseForBarAnimation = false;
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
    };
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
    /**
     *
     * @param {?} lastTopFloored -scrolltop after applygin the parallax factor
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.onTranslate = /**
     *
     * @param {?} lastTopFloored -scrolltop after applygin the parallax factor
     * @return {?}
     */
    function (lastTopFloored) {
        this.renderer.setStyle(this.el.nativeElement, this.plt.Css.transform, "translate3d(0, " + -lastTopFloored + "px ,0)");
        //TODO:to adjust our content with the header
        // this.renderer.setStyle(
        //   this.contentScrollElement,
        //   this.plt.Css.transform,
        //   `translate3d(0, ${-lastTopFloored}px ,0)`
        // );
        this.renderer.setStyle(this.contentScrollElement, "top", -lastTopFloored + "px");
        //TODO:to adjust our tab with the header
        if (this.tabbarPlacement == "top") {
            this.renderer.setStyle(this.tabbarElement, this.plt.Css.transform, "translate3d(0, " + -lastTopFloored + "px ,0)");
        }
    };
    ScrollingHeaderDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[scrollingHeader]"
                },] },
    ];
    /** @nocollapse */
    ScrollingHeaderDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
        { type: NgZone, },
        { type: Platform, },
    ]; };
    ScrollingHeaderDirective.propDecorators = {
        "content": [{ type: Input, args: ["scrollingHeader",] },],
    };
    return ScrollingHeaderDirective;
}());
export { ScrollingHeaderDirective };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsaW5nLWhlYWRlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYy1zY3JvbGxpbmctaGVhZGVyLyIsInNvdXJjZXMiOlsic2Nyb2xsaW5nLWhlYWRlci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLEtBQUssRUFDTCxTQUFTLEVBR1QsTUFBTSxFQUNQLE1BQU0sZUFBZSxDQUFDO0FBS3ZCLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDOztJQThDaEQsa0NBQ1UsSUFDQSxVQUNBLE1BQ0Q7UUFIQyxPQUFFLEdBQUYsRUFBRTtRQUNGLGFBQVEsR0FBUixRQUFRO1FBQ1IsU0FBSSxHQUFKLElBQUk7UUFDTCxRQUFHLEdBQUgsR0FBRzs2QkF0Q29CLENBQUM7NkJBQ0QsQ0FBQztrQ0FLSyxJQUFJO29DQUVGLEtBQUs7bUNBQ2YsR0FBRzt5QkFJYixDQUFDOzZCQUNHLENBQUM7NEJBQ0YsQ0FBQzs0QkFDRCxDQUFDOzhCQUVDLENBQUM7Ozs7a0NBTUcsR0FBRztrQ0FDSCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsR0FBRztLQWVyRDs7OztJQUNMLGtEQUFlOzs7SUFBZjtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7U0FFdEI7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQTtTQUNuRTtLQUNGOzs7O0lBQ0QsZ0RBQWE7OztJQUFiO1FBQUEsaUJBc0JDOztRQW5CQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUss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ICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBJbnB1dCxcclxuICBSZW5kZXJlcjIsXHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBPbkRlc3Ryb3ksXHJcbiAgTmdab25lXHJcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuLy8gS2VlcCBhbiBleWUgb24gdGhpcy4gU2hvdWxkIGV2ZW50dWFsbHkgYmUgYWJsZSB0byBhbmltYXRlIHNob3cvaGlkZS5cclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FwYWNoZS9jb3Jkb3ZhLXBsdWdpbi1zdGF0dXNiYXIvcHVsbC8zN1xyXG4vLyBpbXBvcnQgeyBTdGF0dXNCYXIgfSBmcm9tIFwiQGlvbmljLW5hdGl2ZS9zdGF0dXMtYmFyXCI7XHJcblxyXG5pbXBvcnQgeyBQbGF0Zm9ybSwgQ29udGVudCB9IGZyb20gXCJpb25pYy1hbmd1bGFyXCI7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogXCJbc2Nyb2xsaW5nSGVhZGVyXVwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxpbmdIZWFkZXJEaXJlY3RpdmVcclxuICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcbiAgLy8gVE9ETzogQ29uc2lkZXIgbWVhc3VyaW5nIHRoZSBjb250ZW50IHRvIHNlZSBpZiBpdCdzIHdvcnRoIGFjdGl2YXRpbmcuXHJcbiAgLy8gT3IganVzdCBsZWF2ZSBpdCB1cCB0byBkZXZzIHRvIGRlY2lkZSB3aGljaCBwYWdlcyBmb3Igd2hpY2ggaXQncyBuZWNlc3NhcnkuXHJcbiAgLy8gTWF5YmUgcmVzZXQgd2l0aCBleHBvcnRBcyAtIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM2MzQ1OTQ4LzEzNDE4MzhcclxuICAvLyBUT0RPOiBIYW5kbGUgc2NyZWVuIHJlc2l6ZXNcclxuICBwcml2YXRlIGhlYWRlckhlaWdodDogbnVtYmVyO1xyXG4gIHByaXZhdGUgbGFzdFNjcm9sbFRvcDogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIGxhc3RIZWFkZXJUb3A6IG51bWJlciA9IDA7XHJcblxyXG4gIC8vIEknbSB1c2luZyB0aGlzIGJlY2F1c2UgSSBkb24ndCBrbm93IHdoZW4gdGhlIGRpZmZlcmVudCBwbGF0Zm9ybXMgZGVjaWRlXHJcbiAgLy8gaWYgU3RhdHVzQmFyLmlzVmlzaWJsZSBpcyB0cnVlL2ZhbHNlOyBpcyBpdCBpbW1lZGlhdGUgb3IgYWZ0ZXIgYW5pbWF0aW9uP1xyXG4gIC8vIEl0IGFsc28gcHJldmVudHMgb25nb2luZyBjb25zb2xlIHdhcm5pbmdzIGFib3V0IENvcmRvdmEuXHJcbiAgcHJpdmF0ZSBpc1N0YXR1c0JhclNob3dpbmc6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBwcml2YXRlIHBhdXNlRm9yQmFyQW5pbWF0aW9uOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBwYXVzZUZvckJhckR1cmF0aW9uID0gNTAwO1xyXG5cclxuICAvLyBwcml2YXRlIHNhdmVkQ29uRGltO1xyXG4gIC8vIHJlbmRlciB2YXJzIHNvIHdlIGFyZW4ndCBzY29waW5nIG5ldyBvbmVzIGVhY2ggdGltZVxyXG4gIHByaXZhdGUgc2Nyb2xsVG9wID0gMDtcclxuICBwcml2YXRlIGNvbnRlbnRIZWlnaHQgPSAwO1xyXG4gIHByaXZhdGUgc2Nyb2xsSGVpZ2h0ID0gMDtcclxuICBwcml2YXRlIHNjcm9sbENoYW5nZSA9IDA7XHJcbiAgcHJpdmF0ZSBwYXN0Qm90dG9tOiBib29sZWFuO1xyXG4gIHByaXZhdGUgbGFzdFRvcEZsb29yZWQgPSAwO1xyXG5cclxuICAvKipcclxuICAgKiBUT0RPOiBTb21lIHZhbHVlcyB0byBtYWtlIGEgcGFyYWxsYXggZWZmZWN0XHJcbiAgICovXHJcblxyXG4gIHByaXZhdGUgc2hvd1BhcmFsbGF4RmFjdG9yID0gMC43O1xyXG4gIHByaXZhdGUgaGlkZVBhcmFsbGF4RmFjdG9yID0gdGhpcy5zaG93UGFyYWxsYXhGYWN0b3IgKiAwLjY7XHJcblxyXG4gIEBJbnB1dChcInNjcm9sbGluZ0hlYWRlclwiKSBjb250ZW50OiBDb250ZW50O1xyXG4gIC8vVE9ETzogVG8gY2FjaGUgc2Nyb2xsIGVsZW1lbnQgZnJvbSB0aGUgY29udGVudFxyXG4gIGNvbnRlbnRTY3JvbGxFbGVtZW50OiBIVE1MRWxlbWVudDtcclxuICAvL1RPRE86IFRvIGNhY2hlIHRhYmJhciBhbmQgaXQncyBwbGFjZW1lbnQgZnJvbSB0aGUgY29udGVudFxyXG4gIHRhYmJhckVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gIHRhYmJhclBsYWNlbWVudDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsXHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXHJcbiAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcclxuICAgIHB1YmxpYyBwbHQ6IFBsYXRmb3JtXHJcbiAgICAvLyBwcml2YXRlIHN0YXR1c0JhcjogU3RhdHVzQmFyXHJcbiAgKSB7IH1cclxuICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICBpZiAodGhpcy5jb250ZW50KSB7XHJcbiAgICAgIHRoaXMuc3RhcnRCaW5kaW5ncygpO1xyXG4gICAgICAvLyB0aGlzLnN0YXJ0QmluZGluZ3Nfb2xkKCk7IFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIk5vIGNvbnRlbnQgaXMgcHJvdmlkZWQgZm9yIGlvbmljIHNjcm9saW5nIGhlYWRlciFcIilcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnRCaW5kaW5ncygpIHtcclxuXHJcbiAgICAvL2luaXQgZm9yIHRhYnNcclxuICAgIGlmICh0aGlzLmNvbnRlbnQuX3RhYnMpIHtcclxuICAgICAgdGhpcy50YWJiYXJQbGFjZW1lbnQgPSB0aGlzLmNvbnRlbnQuX3RhYnNbXCJ0YWJzUGxhY2VtZW50XCJdO1xyXG4gICAgICB0aGlzLnRhYmJhckVsZW1lbnQgPSB0aGlzLmNvbnRlbnQuX3RhYnNbXCJfdGFiYmFyXCJdLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy9DYWNoZSB0aGUgc2Nyb2xsIGVsZW1lbnQgYW5kIHRhYmJhciBpbnNpZGUgb3VyIHZhcmlhYmxlc1xyXG4gICAgdGhpcy5jb250ZW50U2Nyb2xsRWxlbWVudCA9IHRoaXMuY29udGVudC5nZXRTY3JvbGxFbGVtZW50KCk7XHJcblxyXG4gICAgLy8gQ2FsbCB0byBpbml0IHZhbHVlcy5cclxuICAgIHRoaXMucmVzaXplKCk7XHJcblxyXG4gICAgLy8gVE9ETzogaW5pdCB0aGUgc2Nyb2xsIHZpZXcgYW5kIGVuYWJsZSBzY3JvbGwgZXZlbnRzXHJcblxyXG4gICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgdGhpcy5jb250ZW50LmlvblNjcm9sbC5zdWJzY3JpYmUoKGV2KSA9PiB7XHJcbiAgICAgICAgdGhpcy5vblBhZ2VTY3JvbGwoZXZlbnQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKGV2KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgfVxyXG5cclxuICByZXNpemUoKSB7XHJcbiAgICAvLyBjbGllbnRIZWlnaHQgYW5kIG9mZnNldEhlaWdodCBpZ25vcmUgYm90dG9tIHNoYWRvdyBpbiBtZWFzdXJtZW50XHJcbiAgICAvLyBidXQgaWYgdGFiIGlzIHBsYWNlZCBhYm92ZSAsIG5vIG5lZWQgdG8gY29uc2lkZXIgdGhlIGJveCBzaGFkb3dzXHJcbiAgICBpZiAodGhpcy50YWJiYXJQbGFjZW1lbnQgPT0gXCJ0b3BcIikge1xyXG4gICAgICB0aGlzLmhlYWRlckhlaWdodCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmhlYWRlckhlaWdodCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICB9XHJcbiAgICAvL2luaXQgY29udGVudCBmb3IgdHJhbnNsYXRpb25cclxuICAgIC8vIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5jb250ZW50U2Nyb2xsRWxlbWVudCxcImJvdHRvbVwiLGAkey10aGlzLmhlYWRlckhlaWdodH1weGApO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyKGV2KSB7XHJcbiAgICBldi5kb21Xcml0ZSgoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlUmVuZGVyKG51bGwpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGdldCBzaG93aW5nSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5oZWFkZXJIZWlnaHQgLSB0aGlzLmxhc3RIZWFkZXJUb3A7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uUGFnZVNjcm9sbChldmVudCkge1xyXG4gICAgdGhpcy5zY3JvbGxUb3AgPSBldmVudC50YXJnZXQuc2Nyb2xsVG9wO1xyXG4gICAgdGhpcy5jb250ZW50SGVpZ2h0ID0gZXZlbnQudGFyZ2V0LmNsaWVudEhlaWdodDtcclxuICAgIHRoaXMuc2Nyb2xsSGVpZ2h0ID0gZXZlbnQudGFyZ2V0LnNjcm9sbEhlaWdodDtcclxuICB9XHJcblxyXG4gIGNhbGN1bGF0ZVJlbmRlcih0aW1lc3RhbXApIHtcclxuICAgIC8vIEdvdHRhIGJlID4gMCBvdGhlcndpc2Ugd2UgYXJlbid0IHNjcm9sbGluZyB5ZXQsIG9yIGFyZSBydWJiZXJiYW5kaW5nLlxyXG4gICAgLy8gSWYgc2Nyb2xsVG9wIGFuZCBsYXN0U2Nyb2xsVG9wIGFyZSB0aGUgc2FtZSwgd2UndmUgc3RvcHBlZCBzY3JvbGxpbmdcclxuICAgIC8vIGFuZCBubyBuZWVkIGZvciBjYWxjdWxhdGlvbnNcclxuICAgIGlmICh0aGlzLnNjcm9sbFRvcCA+PSAwICYmIHRoaXMuc2Nyb2xsVG9wICE9PSB0aGlzLmxhc3RTY3JvbGxUb3ApIHtcclxuICAgICAgLy8gT2J2aW91c1xyXG4gICAgICB0aGlzLnNjcm9sbENoYW5nZSA9IHRoaXMuc2Nyb2xsVG9wIC0gdGhpcy5sYXN0U2Nyb2xsVG9wO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIGZvciBuZXh0IGxvb3BcclxuICAgICAgdGhpcy5sYXN0U2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAvLyBUaGlzIGlzIHdoZXRoZXIgd2UgYXJlIHJ1YmJlcmJhbmRpbmcgcGFzdCB0aGUgYm90dG9tXHJcbiAgICAgIHRoaXMucGFzdEJvdHRvbSA9IHRoaXMuY29udGVudEhlaWdodCArIHRoaXMuc2Nyb2xsVG9wID4gdGhpcy5zY3JvbGxIZWlnaHQ7XHJcblxyXG4gICAgICAvLyBHT0lORyBVUFxyXG4gICAgICBpZiAodGhpcy5zY3JvbGxDaGFuZ2UgPiAwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNTdGF0dXNCYXJTaG93aW5nICYmICF0aGlzLnBhdXNlRm9yQmFyQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAvLyBTdGF0dXNCYXIuaXNWaXNpYmxlXHJcbiAgICAgICAgICB0aGlzLmlzU3RhdHVzQmFyU2hvd2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgLy8gdGhpcy5zdGF0dXNCYXIuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2hyaW5rIHRoZSBoZWFkZXIgd2l0aCB0aGUgc2xvd2VyIGhpZGVQYXJhbGxheEZhY3RvclxyXG4gICAgICAgIHRoaXMubGFzdEhlYWRlclRvcCArPSB0aGlzLnNjcm9sbENoYW5nZSAqIHRoaXMuaGlkZVBhcmFsbGF4RmFjdG9yO1xyXG5cclxuICAgICAgICAvLyBUaGUgaGVhZGVyIG9ubHkgbW92ZXMgb2Zmc2NyZWVuIGFzIGZhciBhcyBpdCBpcyB0YWxsLiBUaGF0IGxlYXZlc1xyXG4gICAgICAgIC8vIGl0IHJlYWR5IHRvIGltbWVkaWF0ZWx5IHNjcm9sbCBiYWNrIHdoZW4gbmVlZGVkLlxyXG4gICAgICAgIGlmICh0aGlzLmxhc3RIZWFkZXJUb3AgPj0gdGhpcy5oZWFkZXJIZWlnaHQpIHtcclxuICAgICAgICAgIHRoaXMubGFzdEhlYWRlclRvcCA9IHRoaXMuaGVhZGVySGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR09JTkcgRE9XTlxyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc2Nyb2xsQ2hhbmdlIDwgMCAmJiAhdGhpcy5wYXN0Qm90dG9tKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGNvbWJpbmF0aW9uIG9mIHNjcm9sbENoYW5nZSA8IDAgJiYgIXBhc3RCb3R0b20gaGFzIHRvIGRvIHdpdGhcclxuICAgICAgICAgKiB0aGUgcmV0dXJuIG1vdmVtZW50IG9mIHRoZSBydWJiZXJiYW5kaW5nIGVmZmVjdCBhZnRlciB5b3UndmUgc2Nyb2xsZWRcclxuICAgICAgICAgKiBhbGwgdGhlIHdheSB0byB0aGUgYm90dG9tIChVUCksIGFuZCBhZnRlciByZWxlYXNpbmcgdGhlIGVsYXN0aWNcclxuICAgICAgICAgKiBpcyBicmluZ2luZyBpdCBiYWNrIGRvd24uIFRoaXMgYWxsb3dzIHlvdSB0byByZWFjaCB0aGUgYm90dG9tLCBhbmRcclxuICAgICAgICAgKiBwdXNoIHRoZSBoZWFkZXIgYXdheSB3aXRob3V0IGl0IHNuZWFraW5nIGJhY2suXHJcbiAgICAgICAgICovXHJcblxyXG4gICAgICAgIC8vIElzIDQwIHRoZSByaWdodCBoZWlnaHQgKGZvciBpT1MpPyBJZiBpdCBzaG93cyB0b28gZWFybHkgaXQgbG9va3Mgd2VpcmQuXHJcbiAgICAgICAgLy8gV2hlbiBhbmltYXRpb24gaXMgYXZhaWxhYmxlLCBpdCB3aWxsIGxvb2sgYmV0dGVyIHRvby5cclxuICAgICAgICBpZiAoIXRoaXMuaXNTdGF0dXNCYXJTaG93aW5nICYmIHRoaXMuc2hvd2luZ0hlaWdodCA+IDQwKSB7XHJcbiAgICAgICAgICAvLyAhU3RhdHVzQmFyLmlzVmlzaWJsZVxyXG4gICAgICAgICAgaWYgKCF0aGlzLnBhdXNlRm9yQmFyQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2VGb3JCYXJBbmltYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3RhdHVzQmFyU2hvd2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc3RhdHVzQmFyLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGF1c2VGb3JCYXJBbmltYXRpb24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSwgdGhpcy5wYXVzZUZvckJhckR1cmF0aW9uKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJldmVhbCB0aGUgaGVhZGVyIHdpdGggdGhlIGZhc3RlciBzaG93UGFyYWxsYXhGYWN0b3JcclxuICAgICAgICB0aGlzLmxhc3RIZWFkZXJUb3AgKz0gdGhpcy5zY3JvbGxDaGFuZ2UgKiB0aGlzLnNob3dQYXJhbGxheEZhY3RvcjtcclxuICAgICAgICAvLyBUaGUgaGVhZGVyIGNhbid0IGdvIHBhc3QgKGdyZWF0ZXIpIHplcm8uIFdlIHNob3VsZCBuZXZlciBzZWUgYW55XHJcbiAgICAgICAgLy8gZ2FwcyBhYm92ZSB0aGUgaGVhZGVyLCBldmVuIHdoZW4gcnViYmVyYmFuZGluZy5cclxuICAgICAgICBpZiAodGhpcy5sYXN0SGVhZGVyVG9wIDw9IDApIHtcclxuICAgICAgICAgIHRoaXMubGFzdEhlYWRlclRvcCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmdyb3VwKGBcXFxcLyBHb2luZyBET1dOIFxcXFwvYCk7XHJcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhgc2Nyb2xsQ2hhbmdlYCwgdGhpcy5zY3JvbGxDaGFuZ2UpO1xyXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coYHNjcm9sbFRvcGAsIHRoaXMuc2Nyb2xsVG9wKTtcclxuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGBsYXN0VG9wYCwgdGhpcy5sYXN0SGVhZGVyVG9wKTtcclxuICAgICAgICAvLyBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gcHJldmVudGVkIGJ5IHNjcm9sbFRvcCAhPT0gbGFzdFNjcm9sbFRvcCBhYm92ZSwgc2hvdWxkbid0IGhhcHBlblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ29pbmcgTk9XSEVSRVwiLCB0aGlzLnNjcm9sbENoYW5nZSwgdGhpcy5zY3JvbGxUb3ApO1xyXG4gICAgICAgIC8vIGNhbmNlbEFuaW1hdGlvbkZyYW1lP1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVc2UgZmxvb3IgdG8gcHJldmVudCBsaW5lIGZsaWNrZXIgYmV0d2VlbiBpb24tbmF2YmFyICYgaW9uLXRvb2xiYXIuXHJcbiAgICAgIC8vIHRoaXMubGFzdFRvcEZsb29yZWQgPSBNYXRoLmZsb29yKHRoaXMubGFzdEhlYWRlclRvcCk7XHJcbiAgICAgIC8vIERvdWJsZSB0aWxkZSBpcyBhIGJpdHdpemUgdmVyc2lvbiBvZiBmbG9vciB0aGF0IGlzIGEgdG91Y2ggZmFzdGVyOlxyXG4gICAgICAvLyBodHRwczovL3lvdXR1LmJlL08zOU9FUEMyMEdNP3Q9ODU5XHJcbiAgICAgIHRoaXMubGFzdFRvcEZsb29yZWQgPSB+fnRoaXMubGFzdEhlYWRlclRvcDtcclxuXHJcbiAgICAgIC8vVHJhbnNsYXRlIGFsbCB0aGUgZWxlbWVudHMgYWNjb3JkaW5nIHRvIHRoZSBsYXN0dG9wZmxvb3JlZFxyXG4gICAgICB0aGlzLm9uVHJhbnNsYXRlKHRoaXMubGFzdFRvcEZsb29yZWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaGVyZSBzaW5jZSB3ZSBhcmUgcnViYmVyYmFuZGluZyBwYXN0IHRoZSB0b3AuXHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vVE9ETzogdG8gbWFrZSB0aGUgaGVhZGVyIHN0YWJsZSBhZnRlciB0aGUgc2Nyb2xsIGlzIGZpbmlzaGVkXHJcbiAgLy9qdXN0IHRvIGF2b2lkIHRoZSBwYXJ0cyBvZiB0aGUgaGVhZGVyIGJlaW5nIG91dHNpZGUgdGhlIGNvbnRhaW5lclxyXG4gIC8vZXZlbiBhZnRlciB0aGUgc2Nyb2xsIGlzIGZpbmlzaGVkLlxyXG4gIC8vIG9uU2Nyb2xsRW5kKCkge1xyXG4gIC8vICAgd2hpbGUgKHRoaXMubGFzdFRvcEZsb29yZWQgPiAwICYmIHRoaXMubGFzdFRvcEZsb29yZWQgPCB0aGlzLmhlYWRlckhlaWdodCkge1xyXG4gIC8vICAgICBpZiAodGhpcy5sYXN0SGVhZGVyVG9wID4gdGhpcy5oZWFkZXJIZWlnaHQgLyAyKSB7XHJcbiAgLy8gICAgICAgdGhpcy5sYXN0SGVhZGVyVG9wKys7XHJcbiAgLy8gICAgIH0gZWxzZSB7XHJcbiAgLy8gICAgICAgdGhpcy5sYXN0SGVhZGVyVG9wLS07XHJcbiAgLy8gICAgIH1cclxuICAvLyAgICAgdGhpcy5sYXN0VG9wRmxvb3JlZCA9IH5+KHRoaXMubGFzdEhlYWRlclRvcCogdGhpcy5oaWRlUGFyYWxsYXhGYWN0b3IpO1xyXG4gIC8vICAgICB0aGlzLm9uVHJhbnNsYXRlKHRoaXMubGFzdFRvcEZsb29yZWQpO1xyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxuXHJcbiAgLy9UT0RPOiB0byB0cmFuc2xhdGUgYWxsIHRoZSBlbGVtZW50c1xyXG4gIC8qKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGxhc3RUb3BGbG9vcmVkIC1zY3JvbGx0b3AgYWZ0ZXIgYXBwbHlnaW4gdGhlIHBhcmFsbGF4IGZhY3RvclxyXG4gICAqL1xyXG4gIG9uVHJhbnNsYXRlKGxhc3RUb3BGbG9vcmVkKSB7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKFxyXG4gICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsXHJcbiAgICAgIHRoaXMucGx0LkNzcy50cmFuc2Zvcm0sXHJcbiAgICAgIGB0cmFuc2xhdGUzZCgwLCAkey1sYXN0VG9wRmxvb3JlZH1weCAsMClgXHJcbiAgICApO1xyXG4gICAgLy9UT0RPOnRvIGFkanVzdCBvdXIgY29udGVudCB3aXRoIHRoZSBoZWFkZXJcclxuICAgIC8vIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAvLyAgIHRoaXMuY29udGVudFNjcm9sbEVsZW1lbnQsXHJcbiAgICAvLyAgIHRoaXMucGx0LkNzcy50cmFuc2Zvcm0sXHJcbiAgICAvLyAgIGB0cmFuc2xhdGUzZCgwLCAkey1sYXN0VG9wRmxvb3JlZH1weCAsMClgXHJcbiAgICAvLyApO1xyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgICAgdGhpcy5jb250ZW50U2Nyb2xsRWxlbWVudCxcclxuICAgICAgXCJ0b3BcIixcclxuICAgICAgYCR7LWxhc3RUb3BGbG9vcmVkfXB4YFxyXG4gICAgKTtcclxuICAgIC8vVE9ETzp0byBhZGp1c3Qgb3VyIHRhYiB3aXRoIHRoZSBoZWFkZXJcclxuICAgIGlmICh0aGlzLnRhYmJhclBsYWNlbWVudCA9PSBcInRvcFwiKSB7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgICAgdGhpcy50YWJiYXJFbGVtZW50LFxyXG4gICAgICAgIHRoaXMucGx0LkNzcy50cmFuc2Zvcm0sXHJcbiAgICAgICAgYHRyYW5zbGF0ZTNkKDAsICR7LWxhc3RUb3BGbG9vcmVkfXB4ICwwKWBcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19