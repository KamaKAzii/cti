module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: './src',

    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'scripts/alertify/*.js',
      'scripts/angular/angular.js',
      'scripts/angular/angular-*.js',
      'scripts/test/lib/angular-mocks.js',
      'scripts/test/lib/sinon.js',
      'scripts/custom/purchasePathApp/module.purchasepath.directive.js',
      'scripts/custom/purchasePathApp/module.purchasepath.filter.js',
      'scripts/custom/purchasePathApp/module.purchasepath.model.js',
      'scripts/custom/purchasePathApp/module.purchasepath.service.js',
      'scripts/custom/purchasePathApp/module.purchasepath.js',
      'scripts/custom/purchasePathApp/controller.*.js',
      'scripts/custom/purchasePathApp/directive.*.js',
      'scripts/custom/purchasePathApp/filter.*.js',
      'scripts/custom/purchasePathApp/model.*.js',
      'scripts/custom/purchasePathApp/service.*.js',
      'scripts/es5shim/es5-shim.js',
      'scripts/jquery/jquery-1.7.1.js',
      'scripts/lodash/lodash.js',
      'scripts/moment/*.js',
      'scripts/ui-bootstrap/*.js',
      'scripts/ui-router/*.js',
      'scripts/test/*.js'
    ],

    // list of files to exclude
    exclude: [
      'scripts/custom/purchasePathApp/service.constant.btobCsc.js',
    ],

    preprocessors: {
      //'client/*.js': ['commonjs'],
    },

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['progress'],

    junitReporter: {
      // will be resolved to basePath (in the same way as files/exclude patterns)
      outputFile: 'test-results.xml'
    },

    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: ['Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: false,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500,

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      //'karma-firefox-launcher',
      //'karma-junit-reporter',
      //'karma-commonjs'
    ]
  });
};