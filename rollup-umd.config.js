export default [{
    input: "./tmp/es5/ionic-scrolling-header.js",
    output: [{
        file: "./dist/umd/ionic-scrolling-header.umd.js",
        format: "umd",
        name: "ionicScrollingHeader",
        globals: {
            '@angular/core': 'ng.core',
            'ionic-angular': 'ionicAngular'
        }
    }],
    external: [
        '@angular/core',
        'ionic-angular'
    ]
}]