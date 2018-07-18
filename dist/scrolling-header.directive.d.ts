import { ElementRef, Renderer2, AfterViewInit, OnDestroy, NgZone } from "@angular/core";
import { Platform, Content } from "ionic-angular";
export declare class ScrollingHeaderDirective implements AfterViewInit, OnDestroy {
    private el;
    private renderer;
    private zone;
    plt: Platform;
    private headerHeight;
    private lastScrollTop;
    private lastHeaderTop;
    private isStatusBarShowing;
    private pauseForBarAnimation;
    private pauseForBarDuration;
    private scrollTop;
    private contentHeight;
    private scrollHeight;
    private scrollChange;
    private pastBottom;
    private lastTopFloored;
    /**
     * TODO: Some values to make a parallax effect
     */
    private showParallaxFactor;
    private hideParallaxFactor;
    content: Content;
    contentScrollElement: HTMLElement;
    tabbarElement: HTMLElement;
    tabbarPlacement: string;
    constructor(el: ElementRef, renderer: Renderer2, zone: NgZone, plt: Platform);
    ngAfterViewInit(): void;
    startBindings(): void;
    ngOnDestroy(): void;
    resize(): void;
    render(ev: any): void;
    readonly showingHeight: number;
    private onPageScroll(event);
    calculateRender(timestamp: any): void;
    /**
     *
     * @param lastTopFloored -scrolltop after applygin the parallax factor
     */
    onTranslate(lastTopFloored: any): void;
}
