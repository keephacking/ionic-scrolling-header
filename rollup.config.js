export default [{
        input: "./build/es5/ionic-scrolling-header.js",
        output: [{
            file: "./dist/ionic-scrolling-header.es5.js",
            format: "es"
        }]
    },
    {
        input: "./build/es2015/ionic-scrolling-header.js",
        output: [{
            file: "./dist/ionic-scrolling-header.es2015.js",
            format: "es",
            name: "ionicScrollingHeader"
        }]
    },
    {
        input: "./build/es2015/ionic-scrolling-header.js",
        output: [{
            file: "./dist/ionic-scrolling-header.umd.js",
            format: "umd",
            name: "ionicScrollingHeader"
        }]
    }
];