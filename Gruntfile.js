/*jshint indent:2*/
/*globals module:false */
// Generated on 2013-05-01 using generator-webapp 0.1.7
'use strict';

// # Globbin
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  grunt.initConfig({
    autoprefixer: {
      options: {
        browsers: ['last 2 version', '> 1%', 'ie 8', 'ie 7']
      },
      dev: {
        files: {
        },
      }
    },
    clean: {
      tmp: {
        src: ['src/*.html']
      } 
    },        
    connect: {
      server: {
        options: {
          port: 9000,
          base: 'src',
          hostname: '0.0.0.0'
        }
      }
    },        
    stencil: {
      main: {
        options: {
          dot_template_settings: {
            strip: false
          },
          meta_data_separator: '##SEPARATOR##',
          dotvar: {
            some_variable: "xxx",
            file_lists: {
              scripts: [{}, 'src/scripts/*.js']
            }
          },
          templates: 'src/htmltemplates',
          partials: 'src/htmlpartials'
        },
        files: [
          {
            expand: true,
            cwd: 'src/htmlpages/',
            src: '*.dot.html',
            dest: 'src/',
            ext: '.html',
            flatten: true
          }
        ]
      }
    },        
    watch: {
      options: {
        livereload: true
      },
      compass: {
        files: ['../Common/**/*.{scss,sass}', 'src/sass/**/*.{scss,sass}', 'src/sass-old/**/*.{scss,sass}', 'src/styles/i/*.{png,jpg}'],
        tasks: ['compass:dev', 'autoprefixer:dev'],
        options: {
          livereload: false,
        },
      },
      css: {
        files: ['src/styles/*.css'],
      },
      html: {
        files: ['src/htmlpages/*.dot.html', 'src/htmltemplates/*.dot.html', 'src/htmlpartials/*.dot.html'],
        tasks: ['stencil']
      },
      //run unit tests with karma (server needs to be already running)
      karma: {
        files: ['src/scripts/**/*.js'],
        tasks: ['karma:unit:run']
      }
    },    
    compass: {
      options: {
        relativeAssets: true,
      },
      dev: {
        options: {
          debugInfo: false,
          sassDir: 'src/sass',
          cssDir: 'src/styles',
          imagesDir: 'src/images',
          javascriptsDir: 'src/scripts',
          fontsDir: 'src/styles/fonts',
          config: 'config_dev.rb',
          outputStyle: 'expanded', 
          force: true,
        }
      },
      build: {
        options: {
          debugInfo: false,
          config: 'config_build.rb',
          outputStyle: 'expanded', 
          relativeAssets: false,
          watch: true,
          force: true,
        }
      },
      cms: {
        options: {
          debugInfo: false,
          config: 'config_cms.rb',
          outputStyle: 'expanded', 
          relativeAssets: false,
          watch: true,
          force: true,
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true,
        browsers: ['PhantomJS']
      }
    }
  });

  // on watch events configure stencil to only run on changed file
  grunt.event.on('watch', function(action, filepath) {
    grunt.config('stencil.main', filepath);
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-stencil');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.registerTask('default', ['connect:server', 'watch']);
  grunt.registerTask('build', ['compass:build']);
  grunt.registerTask('cms', ['compass:cms']);
  grunt.registerTask('test', ['karma:unit', 'watch']); 
  grunt.registerTask('clean', ['clean:tmp']); 
};
