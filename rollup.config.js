export default [{
        input: "./build/ionic-scrolling-header.es5.js",
        output: [{
            file: "./dist/ionic-scrolling-header.es5.js",
            format: "es"
        }]
    },
    {
        input: "./build/ionic-scrolling-header.es2015.js",
        output: [{
            file: "./dist/ionic-scrolling-header.es2015.js",
            format: "es",
            name: "ionicScrollingHeader"
        }]
    },
    {
        input: "./build/ionic-scrolling-header.es2015.js",
        output: [{
            file: "./dist/ionic-scrolling-header.umd.js",
            format: "umd",
            name: "ionicScrollingHeader"
        }]
    }
];