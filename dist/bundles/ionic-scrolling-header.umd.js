(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('ionic-angular')) :
    typeof define === 'function' && define.amd ? define('ionic-scrolling-header', ['exports', '@angular/core', 'ionic-angular'], factory) :
    (factory((global['ionic-scrolling-header'] = {}),global.ng.core,null));
}(this, (function (exports,core,ionicAngular) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var ScrollingHeaderDirective = (function () {
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
             */ function () {
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
            { type: core.Directive, args: [{
                        selector: "[scrollingHeader]"
                    },] },
        ];
        /** @nocollapse */
        ScrollingHeaderDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef, },
                { type: core.Renderer2, },
                { type: core.NgZone, },
                { type: ionicAngular.Platform, },
            ];
        };
        ScrollingHeaderDirective.propDecorators = {
            "content": [{ type: core.Input, args: ["scrollingHeader",] },],
        };
        return ScrollingHeaderDirective;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var ScrollingHeaderModule = (function () {
        function ScrollingHeaderModule() {
        }
        ScrollingHeaderModule.decorators = [
            { type: core.NgModule, args: [{
                        declarations: [
                            ScrollingHeaderDirective
                        ],
                        exports: [
                            ScrollingHeaderDirective
                        ]
                    },] },
        ];
        return ScrollingHeaderModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */

    exports.ScrollingHeaderModule = ScrollingHeaderModule;
    exports.ScrollingHeaderDirective = ScrollingHeaderDirective;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW9uaWMtc2Nyb2xsaW5nLWhlYWRlci51bWQuanMubWFwIiwic291cmNlcyI6WyJuZzovL2lvbmljLXNjcm9sbGluZy1oZWFkZXIvc2Nyb2xsaW5nLWhlYWRlci5kaXJlY3RpdmUudHMiLCJuZzovL2lvbmljLXNjcm9sbGluZy1oZWFkZXIvc2Nyb2xsaW5nLWhlYWRlci5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBJbnB1dCxcclxuICBSZW5kZXJlcjIsXHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBPbkRlc3Ryb3ksXHJcbiAgTmdab25lXHJcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuLy8gS2VlcCBhbiBleWUgb24gdGhpcy4gU2hvdWxkIGV2ZW50dWFsbHkgYmUgYWJsZSB0byBhbmltYXRlIHNob3cvaGlkZS5cclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FwYWNoZS9jb3Jkb3ZhLXBsdWdpbi1zdGF0dXNiYXIvcHVsbC8zN1xyXG4vLyBpbXBvcnQgeyBTdGF0dXNCYXIgfSBmcm9tIFwiQGlvbmljLW5hdGl2ZS9zdGF0dXMtYmFyXCI7XHJcblxyXG5pbXBvcnQgeyBQbGF0Zm9ybSwgQ29udGVudCB9IGZyb20gXCJpb25pYy1hbmd1bGFyXCI7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogXCJbc2Nyb2xsaW5nSGVhZGVyXVwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxpbmdIZWFkZXJEaXJlY3RpdmVcclxuICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcbiAgLy8gVE9ETzogQ29uc2lkZXIgbWVhc3VyaW5nIHRoZSBjb250ZW50IHRvIHNlZSBpZiBpdCdzIHdvcnRoIGFjdGl2YXRpbmcuXHJcbiAgLy8gT3IganVzdCBsZWF2ZSBpdCB1cCB0byBkZXZzIHRvIGRlY2lkZSB3aGljaCBwYWdlcyBmb3Igd2hpY2ggaXQncyBuZWNlc3NhcnkuXHJcbiAgLy8gTWF5YmUgcmVzZXQgd2l0aCBleHBvcnRBcyAtIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM2MzQ1OTQ4LzEzNDE4MzhcclxuICAvLyBUT0RPOiBIYW5kbGUgc2NyZWVuIHJlc2l6ZXNcclxuICBwcml2YXRlIGhlYWRlckhlaWdodDogbnVtYmVyO1xyXG4gIHByaXZhdGUgbGFzdFNjcm9sbFRvcDogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIGxhc3RIZWFkZXJUb3A6IG51bWJlciA9IDA7XHJcblxyXG4gIC8vIEknbSB1c2luZyB0aGlzIGJlY2F1c2UgSSBkb24ndCBrbm93IHdoZW4gdGhlIGRpZmZlcmVudCBwbGF0Zm9ybXMgZGVjaWRlXHJcbiAgLy8gaWYgU3RhdHVzQmFyLmlzVmlzaWJsZSBpcyB0cnVlL2ZhbHNlOyBpcyBpdCBpbW1lZGlhdGUgb3IgYWZ0ZXIgYW5pbWF0aW9uP1xyXG4gIC8vIEl0IGFsc28gcHJldmVudHMgb25nb2luZyBjb25zb2xlIHdhcm5pbmdzIGFib3V0IENvcmRvdmEuXHJcbiAgcHJpdmF0ZSBpc1N0YXR1c0JhclNob3dpbmc6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBwcml2YXRlIHBhdXNlRm9yQmFyQW5pbWF0aW9uOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBwYXVzZUZvckJhckR1cmF0aW9uID0gNTAwO1xyXG5cclxuICAvLyBwcml2YXRlIHNhdmVkQ29uRGltO1xyXG4gIC8vIHJlbmRlciB2YXJzIHNvIHdlIGFyZW4ndCBzY29waW5nIG5ldyBvbmVzIGVhY2ggdGltZVxyXG4gIHByaXZhdGUgc2Nyb2xsVG9wID0gMDtcclxuICBwcml2YXRlIGNvbnRlbnRIZWlnaHQgPSAwO1xyXG4gIHByaXZhdGUgc2Nyb2xsSGVpZ2h0ID0gMDtcclxuICBwcml2YXRlIHNjcm9sbENoYW5nZSA9IDA7XHJcbiAgcHJpdmF0ZSBwYXN0Qm90dG9tOiBib29sZWFuO1xyXG4gIHByaXZhdGUgbGFzdFRvcEZsb29yZWQgPSAwO1xyXG5cclxuICAvKipcclxuICAgKiBUT0RPOiBTb21lIHZhbHVlcyB0byBtYWtlIGEgcGFyYWxsYXggZWZmZWN0XHJcbiAgICovXHJcblxyXG4gIHByaXZhdGUgc2hvd1BhcmFsbGF4RmFjdG9yID0gMC43O1xyXG4gIHByaXZhdGUgaGlkZVBhcmFsbGF4RmFjdG9yID0gdGhpcy5zaG93UGFyYWxsYXhGYWN0b3IgKiAwLjY7XHJcblxyXG4gIEBJbnB1dChcInNjcm9sbGluZ0hlYWRlclwiKSBjb250ZW50OiBDb250ZW50O1xyXG4gIC8vVE9ETzogVG8gY2FjaGUgc2Nyb2xsIGVsZW1lbnQgZnJvbSB0aGUgY29udGVudFxyXG4gIGNvbnRlbnRTY3JvbGxFbGVtZW50OiBIVE1MRWxlbWVudDtcclxuICAvL1RPRE86IFRvIGNhY2hlIHRhYmJhciBhbmQgaXQncyBwbGFjZW1lbnQgZnJvbSB0aGUgY29udGVudFxyXG4gIHRhYmJhckVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gIHRhYmJhclBsYWNlbWVudDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsXHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXHJcbiAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcclxuICAgIHB1YmxpYyBwbHQ6IFBsYXRmb3JtXHJcbiAgICAvLyBwcml2YXRlIHN0YXR1c0JhcjogU3RhdHVzQmFyXHJcbiAgKSB7IH1cclxuICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICBpZiAodGhpcy5jb250ZW50KSB7XHJcbiAgICAgIHRoaXMuc3RhcnRCaW5kaW5ncygpO1xyXG4gICAgICAvLyB0aGlzLnN0YXJ0QmluZGluZ3Nfb2xkKCk7IFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIk5vIGNvbnRlbnQgaXMgcHJvdmlkZWQgZm9yIGlvbmljIHNjcm9saW5nIGhlYWRlciFcIilcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnRCaW5kaW5ncygpIHtcclxuXHJcbiAgICAvL2luaXQgZm9yIHRhYnNcclxuICAgIGlmICh0aGlzLmNvbnRlbnQuX3RhYnMpIHtcclxuICAgICAgdGhpcy50YWJiYXJQbGFjZW1lbnQgPSB0aGlzLmNvbnRlbnQuX3RhYnNbXCJ0YWJzUGxhY2VtZW50XCJdO1xyXG4gICAgICB0aGlzLnRhYmJhckVsZW1lbnQgPSB0aGlzLmNvbnRlbnQuX3RhYnNbXCJfdGFiYmFyXCJdLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy9DYWNoZSB0aGUgc2Nyb2xsIGVsZW1lbnQgYW5kIHRhYmJhciBpbnNpZGUgb3VyIHZhcmlhYmxlc1xyXG4gICAgdGhpcy5jb250ZW50U2Nyb2xsRWxlbWVudCA9IHRoaXMuY29udGVudC5nZXRTY3JvbGxFbGVtZW50KCk7XHJcblxyXG4gICAgLy8gQ2FsbCB0byBpbml0IHZhbHVlcy5cclxuICAgIHRoaXMucmVzaXplKCk7XHJcblxyXG4gICAgLy8gVE9ETzogaW5pdCB0aGUgc2Nyb2xsIHZpZXcgYW5kIGVuYWJsZSBzY3JvbGwgZXZlbnRzXHJcblxyXG4gICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgdGhpcy5jb250ZW50LmlvblNjcm9sbC5zdWJzY3JpYmUoKGV2KSA9PiB7XHJcbiAgICAgICAgdGhpcy5vblBhZ2VTY3JvbGwoZXZlbnQpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKGV2KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgfVxyXG5cclxuICByZXNpemUoKSB7XHJcbiAgICAvLyBjbGllbnRIZWlnaHQgYW5kIG9mZnNldEhlaWdodCBpZ25vcmUgYm90dG9tIHNoYWRvdyBpbiBtZWFzdXJtZW50XHJcbiAgICAvLyBidXQgaWYgdGFiIGlzIHBsYWNlZCBhYm92ZSAsIG5vIG5lZWQgdG8gY29uc2lkZXIgdGhlIGJveCBzaGFkb3dzXHJcbiAgICBpZiAodGhpcy50YWJiYXJQbGFjZW1lbnQgPT0gXCJ0b3BcIikge1xyXG4gICAgICB0aGlzLmhlYWRlckhlaWdodCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmhlYWRlckhlaWdodCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICB9XHJcbiAgICAvL2luaXQgY29udGVudCBmb3IgdHJhbnNsYXRpb25cclxuICAgIC8vIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5jb250ZW50U2Nyb2xsRWxlbWVudCxcImJvdHRvbVwiLGAkey10aGlzLmhlYWRlckhlaWdodH1weGApO1xyXG4gIH1cclxuXHJcbiAgcmVuZGVyKGV2KSB7XHJcbiAgICBldi5kb21Xcml0ZSgoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlUmVuZGVyKG51bGwpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGdldCBzaG93aW5nSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5oZWFkZXJIZWlnaHQgLSB0aGlzLmxhc3RIZWFkZXJUb3A7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uUGFnZVNjcm9sbChldmVudCkge1xyXG4gICAgdGhpcy5zY3JvbGxUb3AgPSBldmVudC50YXJnZXQuc2Nyb2xsVG9wO1xyXG4gICAgdGhpcy5jb250ZW50SGVpZ2h0ID0gZXZlbnQudGFyZ2V0LmNsaWVudEhlaWdodDtcclxuICAgIHRoaXMuc2Nyb2xsSGVpZ2h0ID0gZXZlbnQudGFyZ2V0LnNjcm9sbEhlaWdodDtcclxuICB9XHJcblxyXG4gIGNhbGN1bGF0ZVJlbmRlcih0aW1lc3RhbXApIHtcclxuICAgIC8vIEdvdHRhIGJlID4gMCBvdGhlcndpc2Ugd2UgYXJlbid0IHNjcm9sbGluZyB5ZXQsIG9yIGFyZSBydWJiZXJiYW5kaW5nLlxyXG4gICAgLy8gSWYgc2Nyb2xsVG9wIGFuZCBsYXN0U2Nyb2xsVG9wIGFyZSB0aGUgc2FtZSwgd2UndmUgc3RvcHBlZCBzY3JvbGxpbmdcclxuICAgIC8vIGFuZCBubyBuZWVkIGZvciBjYWxjdWxhdGlvbnNcclxuICAgIGlmICh0aGlzLnNjcm9sbFRvcCA+PSAwICYmIHRoaXMuc2Nyb2xsVG9wICE9PSB0aGlzLmxhc3RTY3JvbGxUb3ApIHtcclxuICAgICAgLy8gT2J2aW91c1xyXG4gICAgICB0aGlzLnNjcm9sbENoYW5nZSA9IHRoaXMuc2Nyb2xsVG9wIC0gdGhpcy5sYXN0U2Nyb2xsVG9wO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIGZvciBuZXh0IGxvb3BcclxuICAgICAgdGhpcy5sYXN0U2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAvLyBUaGlzIGlzIHdoZXRoZXIgd2UgYXJlIHJ1YmJlcmJhbmRpbmcgcGFzdCB0aGUgYm90dG9tXHJcbiAgICAgIHRoaXMucGFzdEJvdHRvbSA9IHRoaXMuY29udGVudEhlaWdodCArIHRoaXMuc2Nyb2xsVG9wID4gdGhpcy5zY3JvbGxIZWlnaHQ7XHJcblxyXG4gICAgICAvLyBHT0lORyBVUFxyXG4gICAgICBpZiAodGhpcy5zY3JvbGxDaGFuZ2UgPiAwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNTdGF0dXNCYXJTaG93aW5nICYmICF0aGlzLnBhdXNlRm9yQmFyQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAvLyBTdGF0dXNCYXIuaXNWaXNpYmxlXHJcbiAgICAgICAgICB0aGlzLmlzU3RhdHVzQmFyU2hvd2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgLy8gdGhpcy5zdGF0dXNCYXIuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2hyaW5rIHRoZSBoZWFkZXIgd2l0aCB0aGUgc2xvd2VyIGhpZGVQYXJhbGxheEZhY3RvclxyXG4gICAgICAgIHRoaXMubGFzdEhlYWRlclRvcCArPSB0aGlzLnNjcm9sbENoYW5nZSAqIHRoaXMuaGlkZVBhcmFsbGF4RmFjdG9yO1xyXG5cclxuICAgICAgICAvLyBUaGUgaGVhZGVyIG9ubHkgbW92ZXMgb2Zmc2NyZWVuIGFzIGZhciBhcyBpdCBpcyB0YWxsLiBUaGF0IGxlYXZlc1xyXG4gICAgICAgIC8vIGl0IHJlYWR5IHRvIGltbWVkaWF0ZWx5IHNjcm9sbCBiYWNrIHdoZW4gbmVlZGVkLlxyXG4gICAgICAgIGlmICh0aGlzLmxhc3RIZWFkZXJUb3AgPj0gdGhpcy5oZWFkZXJIZWlnaHQpIHtcclxuICAgICAgICAgIHRoaXMubGFzdEhlYWRlclRvcCA9IHRoaXMuaGVhZGVySGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR09JTkcgRE9XTlxyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc2Nyb2xsQ2hhbmdlIDwgMCAmJiAhdGhpcy5wYXN0Qm90dG9tKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGNvbWJpbmF0aW9uIG9mIHNjcm9sbENoYW5nZSA8IDAgJiYgIXBhc3RCb3R0b20gaGFzIHRvIGRvIHdpdGhcclxuICAgICAgICAgKiB0aGUgcmV0dXJuIG1vdmVtZW50IG9mIHRoZSBydWJiZXJiYW5kaW5nIGVmZmVjdCBhZnRlciB5b3UndmUgc2Nyb2xsZWRcclxuICAgICAgICAgKiBhbGwgdGhlIHdheSB0byB0aGUgYm90dG9tIChVUCksIGFuZCBhZnRlciByZWxlYXNpbmcgdGhlIGVsYXN0aWNcclxuICAgICAgICAgKiBpcyBicmluZ2luZyBpdCBiYWNrIGRvd24uIFRoaXMgYWxsb3dzIHlvdSB0byByZWFjaCB0aGUgYm90dG9tLCBhbmRcclxuICAgICAgICAgKiBwdXNoIHRoZSBoZWFkZXIgYXdheSB3aXRob3V0IGl0IHNuZWFraW5nIGJhY2suXHJcbiAgICAgICAgICovXHJcblxyXG4gICAgICAgIC8vIElzIDQwIHRoZSByaWdodCBoZWlnaHQgKGZvciBpT1MpPyBJZiBpdCBzaG93cyB0b28gZWFybHkgaXQgbG9va3Mgd2VpcmQuXHJcbiAgICAgICAgLy8gV2hlbiBhbmltYXRpb24gaXMgYXZhaWxhYmxlLCBpdCB3aWxsIGxvb2sgYmV0dGVyIHRvby5cclxuICAgICAgICBpZiAoIXRoaXMuaXNTdGF0dXNCYXJTaG93aW5nICYmIHRoaXMuc2hvd2luZ0hlaWdodCA+IDQwKSB7XHJcbiAgICAgICAgICAvLyAhU3RhdHVzQmFyLmlzVmlzaWJsZVxyXG4gICAgICAgICAgaWYgKCF0aGlzLnBhdXNlRm9yQmFyQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2VGb3JCYXJBbmltYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3RhdHVzQmFyU2hvd2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc3RhdHVzQmFyLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMucGF1c2VGb3JCYXJBbmltYXRpb24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSwgdGhpcy5wYXVzZUZvckJhckR1cmF0aW9uKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJldmVhbCB0aGUgaGVhZGVyIHdpdGggdGhlIGZhc3RlciBzaG93UGFyYWxsYXhGYWN0b3JcclxuICAgICAgICB0aGlzLmxhc3RIZWFkZXJUb3AgKz0gdGhpcy5zY3JvbGxDaGFuZ2UgKiB0aGlzLnNob3dQYXJhbGxheEZhY3RvcjtcclxuICAgICAgICAvLyBUaGUgaGVhZGVyIGNhbid0IGdvIHBhc3QgKGdyZWF0ZXIpIHplcm8uIFdlIHNob3VsZCBuZXZlciBzZWUgYW55XHJcbiAgICAgICAgLy8gZ2FwcyBhYm92ZSB0aGUgaGVhZGVyLCBldmVuIHdoZW4gcnViYmVyYmFuZGluZy5cclxuICAgICAgICBpZiAodGhpcy5sYXN0SGVhZGVyVG9wIDw9IDApIHtcclxuICAgICAgICAgIHRoaXMubGFzdEhlYWRlclRvcCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmdyb3VwKGBcXFxcLyBHb2luZyBET1dOIFxcXFwvYCk7XHJcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhgc2Nyb2xsQ2hhbmdlYCwgdGhpcy5zY3JvbGxDaGFuZ2UpO1xyXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coYHNjcm9sbFRvcGAsIHRoaXMuc2Nyb2xsVG9wKTtcclxuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGBsYXN0VG9wYCwgdGhpcy5sYXN0SGVhZGVyVG9wKTtcclxuICAgICAgICAvLyBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gcHJldmVudGVkIGJ5IHNjcm9sbFRvcCAhPT0gbGFzdFNjcm9sbFRvcCBhYm92ZSwgc2hvdWxkbid0IGhhcHBlblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ29pbmcgTk9XSEVSRVwiLCB0aGlzLnNjcm9sbENoYW5nZSwgdGhpcy5zY3JvbGxUb3ApO1xyXG4gICAgICAgIC8vIGNhbmNlbEFuaW1hdGlvbkZyYW1lP1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVc2UgZmxvb3IgdG8gcHJldmVudCBsaW5lIGZsaWNrZXIgYmV0d2VlbiBpb24tbmF2YmFyICYgaW9uLXRvb2xiYXIuXHJcbiAgICAgIC8vIHRoaXMubGFzdFRvcEZsb29yZWQgPSBNYXRoLmZsb29yKHRoaXMubGFzdEhlYWRlclRvcCk7XHJcbiAgICAgIC8vIERvdWJsZSB0aWxkZSBpcyBhIGJpdHdpemUgdmVyc2lvbiBvZiBmbG9vciB0aGF0IGlzIGEgdG91Y2ggZmFzdGVyOlxyXG4gICAgICAvLyBodHRwczovL3lvdXR1LmJlL08zOU9FUEMyMEdNP3Q9ODU5XHJcbiAgICAgIHRoaXMubGFzdFRvcEZsb29yZWQgPSB+fnRoaXMubGFzdEhlYWRlclRvcDtcclxuXHJcbiAgICAgIC8vVHJhbnNsYXRlIGFsbCB0aGUgZWxlbWVudHMgYWNjb3JkaW5nIHRvIHRoZSBsYXN0dG9wZmxvb3JlZFxyXG4gICAgICB0aGlzLm9uVHJhbnNsYXRlKHRoaXMubGFzdFRvcEZsb29yZWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaGVyZSBzaW5jZSB3ZSBhcmUgcnViYmVyYmFuZGluZyBwYXN0IHRoZSB0b3AuXHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vVE9ETzogdG8gbWFrZSB0aGUgaGVhZGVyIHN0YWJsZSBhZnRlciB0aGUgc2Nyb2xsIGlzIGZpbmlzaGVkXHJcbiAgLy9qdXN0IHRvIGF2b2lkIHRoZSBwYXJ0cyBvZiB0aGUgaGVhZGVyIGJlaW5nIG91dHNpZGUgdGhlIGNvbnRhaW5lclxyXG4gIC8vZXZlbiBhZnRlciB0aGUgc2Nyb2xsIGlzIGZpbmlzaGVkLlxyXG4gIC8vIG9uU2Nyb2xsRW5kKCkge1xyXG4gIC8vICAgd2hpbGUgKHRoaXMubGFzdFRvcEZsb29yZWQgPiAwICYmIHRoaXMubGFzdFRvcEZsb29yZWQgPCB0aGlzLmhlYWRlckhlaWdodCkge1xyXG4gIC8vICAgICBpZiAodGhpcy5sYXN0SGVhZGVyVG9wID4gdGhpcy5oZWFkZXJIZWlnaHQgLyAyKSB7XHJcbiAgLy8gICAgICAgdGhpcy5sYXN0SGVhZGVyVG9wKys7XHJcbiAgLy8gICAgIH0gZWxzZSB7XHJcbiAgLy8gICAgICAgdGhpcy5sYXN0SGVhZGVyVG9wLS07XHJcbiAgLy8gICAgIH1cclxuICAvLyAgICAgdGhpcy5sYXN0VG9wRmxvb3JlZCA9IH5+KHRoaXMubGFzdEhlYWRlclRvcCogdGhpcy5oaWRlUGFyYWxsYXhGYWN0b3IpO1xyXG4gIC8vICAgICB0aGlzLm9uVHJhbnNsYXRlKHRoaXMubGFzdFRvcEZsb29yZWQpO1xyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxuXHJcbiAgLy9UT0RPOiB0byB0cmFuc2xhdGUgYWxsIHRoZSBlbGVtZW50c1xyXG4gIC8qKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGxhc3RUb3BGbG9vcmVkIC1zY3JvbGx0b3AgYWZ0ZXIgYXBwbHlnaW4gdGhlIHBhcmFsbGF4IGZhY3RvclxyXG4gICAqL1xyXG4gIG9uVHJhbnNsYXRlKGxhc3RUb3BGbG9vcmVkKSB7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKFxyXG4gICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsXHJcbiAgICAgIHRoaXMucGx0LkNzcy50cmFuc2Zvcm0sXHJcbiAgICAgIGB0cmFuc2xhdGUzZCgwLCAkey1sYXN0VG9wRmxvb3JlZH1weCAsMClgXHJcbiAgICApO1xyXG4gICAgLy9UT0RPOnRvIGFkanVzdCBvdXIgY29udGVudCB3aXRoIHRoZSBoZWFkZXJcclxuICAgIC8vIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAvLyAgIHRoaXMuY29udGVudFNjcm9sbEVsZW1lbnQsXHJcbiAgICAvLyAgIHRoaXMucGx0LkNzcy50cmFuc2Zvcm0sXHJcbiAgICAvLyAgIGB0cmFuc2xhdGUzZCgwLCAkey1sYXN0VG9wRmxvb3JlZH1weCAsMClgXHJcbiAgICAvLyApO1xyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgICAgdGhpcy5jb250ZW50U2Nyb2xsRWxlbWVudCxcclxuICAgICAgXCJ0b3BcIixcclxuICAgICAgYCR7LWxhc3RUb3BGbG9vcmVkfXB4YFxyXG4gICAgKTtcclxuICAgIC8vVE9ETzp0byBhZGp1c3Qgb3VyIHRhYiB3aXRoIHRoZSBoZWFkZXJcclxuICAgIGlmICh0aGlzLnRhYmJhclBsYWNlbWVudCA9PSBcInRvcFwiKSB7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgICAgdGhpcy50YWJiYXJFbGVtZW50LFxyXG4gICAgICAgIHRoaXMucGx0LkNzcy50cmFuc2Zvcm0sXHJcbiAgICAgICAgYHRyYW5zbGF0ZTNkKDAsICR7LWxhc3RUb3BGbG9vcmVkfXB4ICwwKWBcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBTY3JvbGxpbmdIZWFkZXJEaXJlY3RpdmUgfSBmcm9tICcuL3Njcm9sbGluZy1oZWFkZXIuZGlyZWN0aXZlJztcclxuZXhwb3J0ICogZnJvbSBcIi4vc2Nyb2xsaW5nLWhlYWRlci5kaXJlY3RpdmVcIjtcclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFtcclxuICAgIFNjcm9sbGluZ0hlYWRlckRpcmVjdGl2ZVxyXG4gIF0sXHJcbiAgZXhwb3J0czpbXHJcbiAgICBTY3JvbGxpbmdIZWFkZXJEaXJlY3RpdmVcclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxpbmdIZWFkZXJNb2R1bGUge31cclxuIl0sIm5hbWVzIjpbIkRpcmVjdGl2ZSIsIkVsZW1lbnRSZWYiLCJSZW5kZXJlcjIiLCJOZ1pvbmUiLCJQbGF0Zm9ybSIsIklucHV0IiwiTmdNb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtRQTJERSxrQ0FDVSxJQUNBLFVBQ0EsTUFDRDtZQUhDLE9BQUUsR0FBRixFQUFFO1lBQ0YsYUFBUSxHQUFSLFFBQVE7WUFDUixTQUFJLEdBQUosSUFBSTtZQUNMLFFBQUcsR0FBSCxHQUFHO2lDQXRDb0IsQ0FBQztpQ0FDRCxDQUFDO3NDQUtLLElBQUk7d0NBRUYsS0FBSzt1Q0FDZixHQUFHOzZCQUliLENBQUM7aUNBQ0csQ0FBQztnQ0FDRixDQUFDO2dDQUNELENBQUM7a0NBRUMsQ0FBQzs7OztzQ0FNRyxHQUFHO3NDQUNILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxHQUFHO1NBZXJEOzs7O1FBQ0wsa0RBQWU7OztZQUFmO2dCQUNFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDaEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztpQkFFdEI7cUJBQU07b0JBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFBO2lCQUNuRTthQUNGOzs7O1FBQ0QsZ0RBQWE7OztZQUFiO2dCQUFBLGlCQXNCQzs7Z0JBbkJDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7b0JBQ3RCLElBQUks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