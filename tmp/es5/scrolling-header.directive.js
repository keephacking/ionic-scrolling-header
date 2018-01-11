/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Directive, ElementRef, Input, Renderer2, AfterViewInit, OnDestroy, NgZone } from "@angular/core";
import { ScrollView } from "ionic-angular/util/scroll-view";
// Keep an eye on this. Should eventually be able to animate show/hide.
// https://github.com/apache/cordova-plugin-statusbar/pull/37
import { StatusBar } from "@ionic-native/status-bar";
import { Platform, App, DomController, Content } from "ionic-angular";
var ScrollingHeaderDirective = /** @class */ (function () {
    function ScrollingHeaderDirective(el, renderer, zone, plt, domCtrl, app, statusBar) {
        this.el = el;
        this.renderer = renderer;
        this.zone = zone;
        this.plt = plt;
        this.domCtrl = domCtrl;
        this.app = app;
        this.statusBar = statusBar;
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
        this.scroll = new ScrollView(this.app, this.plt, this.domCtrl);
        this.scroll.enableEvents();
        this.zone.runOutsideAngular(function () {
            _this.scroll.init(_this.content.getScrollElement(), _this.headerHeight, 0);
            _this.scroll.onScroll = function (ev) {
                _this.scrollDir = ev.directionY;
                _this.onPageScroll(event);
            };
            // this.scroll.onScrollEnd = ev => {
            //   console.log("scroll end function");
            // };
            // this.scroll.onScrollEnd = ev => {
            //   console.log("scroll end function");
            // };
            _this.scroll.onScrollStart = function (ev) {
                console.log("scroll started");
                if (_this.scrollEndTimeout) {
                    clearTimeout(_this.scrollEndTimeout);
                }
                _this.render(null); //my-edits
            };
        });
    };
    /**
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this.scroll && this.scroll.destroy();
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
    };
    /**
     * @param {?} ts
     * @return {?}
     */
    ScrollingHeaderDirective.prototype.render = /**
     * @param {?} ts
     * @return {?}
     */
    function (ts) {
        var _this = this;
        var /** @type {?} */ rAFInt = this.plt.raf(function (ts) { return _this.render(ts); });
        if (this.scroll.isScrolling) {
            //we need animation frame only when someone is scrolling
            this.calculateRender(ts);
        }
        else {
            //if no scrolling then we can cancel the current animation frame
            //and will start when the scroll start event fires
            this.plt.cancelRaf(rAFInt);
        }
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
                    this.statusBar.hide();
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
                        this.statusBar.show();
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
        { type: DomController, },
        { type: App, },
        { type: StatusBar, },
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
    ScrollingHeaderDirective.prototype.scroll;
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
    ScrollingHeaderDirective.prototype.scrollEndTimeout;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.scrollTop;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.contentHeight;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.scrollHeight;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.scrollChange;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.scrollDir;
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
    /** @type {?} */
    ScrollingHeaderDirective.prototype.domCtrl;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.app;
    /** @type {?} */
    ScrollingHeaderDirective.prototype.statusBar;
}
//# sourceMappingURL=scrolling-header.directive.js.map