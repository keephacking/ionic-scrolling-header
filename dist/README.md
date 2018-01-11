# ionic-scrolling-header
An angular directive to make the header hide with scrolling

**version 0.1.0**

## Usage

* install- `npm install ionic-scrolling-header --sav-dev`

* add to your module `import {ScrollingHeaderModule} from 'ionic-scrolling-header';`

* add ` @ViewChild(Content) content: Content;` in your component

* and add in your template


`<ion-header [scrollingHeader]='content'>
    <ion-navbar>
        <ion-title>
            Contact
        </ion-title>
    </ion-navbar>
</ion-header>`
* :) good to go
## Demo
### [For Demo Check Here](https://stackblitz.com/edit/ionic-scrolling-header-demo)
![Plugin preview](https://raw.githubusercontent.com/keephacking/ionic-scrolling-header/master/demo/demo.gif)
