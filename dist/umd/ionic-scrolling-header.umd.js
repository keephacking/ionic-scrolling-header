(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('ionic-angular')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'ionic-angular'], factory) :
	(factory((global.ionicScrollingHeader = {}),global.ng.core,global.ionicAngular));
}(this, (function (exports,core,ionicAngular) { 'use strict';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var ScrollingHeaderDirective = /** @class */ (function () {
    function ScrollingHeaderDirective(el, renderer, zone, plt, domCtrl, app) {
        this.el = el;
        this.renderer = renderer;
        this.zone = zone;
        this.plt = plt;
        this.domCtrl = domCtrl;
        this.app = app;
        this.lastScrollTop = 0;
        this.lastHeaderTop = 0;
        this.isStatusBarShowing = true;
        this.pauseForBarAnimation = false;
        this.pauseForBarDuration = 500;
        this.scrollTop = 0;
        this.contentHeight = 0;
        this.scrollHeight = 0;
        this.scrollChange = 0;
        this.scrollDir = null;
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
            throw new Error("no content input is given");
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
        this.tabbarPlacement = this.content._tabs["tabsPlacement"];
        this.tabbarElement = this.content._tabs["_tabbar"].nativeElement;
        //Cache the scroll element and tabbar inside our variables
        this.contentScrollElement = this.content.getScrollElement();
        // Call to init values.
        this.resize();
        // TODO: init the scroll view and enable scroll events
        this.zone.runOutsideAngular(function () {
            _this.content.ionScroll.subscribe(function (ev) {
                _this.scrollDir = ev.directionY;
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
        { type: core.Directive, args: [{
                    selector: "[scrollingHeader]"
                },] },
    ];
    /** @nocollapse */
    ScrollingHeaderDirective.ctorParameters = function () { return [
        { type: core.ElementRef, },
        { type: core.Renderer2, },
        { type: core.NgZone, },
        { type: ionicAngular.Platform, },
        { type: ionicAngular.DomController, },
        { type: ionicAngular.App, },
    ]; };
    ScrollingHeaderDirective.propDecorators = {
        "content": [{ type: core.Input, args: ["scrollingHeader",] },],
    };
    return ScrollingHeaderDirective;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var ScrollingHeaderModule = /** @class */ (function () {
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
    /** @nocollapse */
    ScrollingHeaderModule.ctorParameters = function () { return []; };
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

exports.ScrollingHeaderModule = ScrollingHeaderModule;
exports.ScrollingHeaderDirective = ScrollingHeaderDirective;

Object.defineProperty(exports, '__esModule', { value: true });

})));
