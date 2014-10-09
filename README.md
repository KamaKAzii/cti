Wng.FrontEnd CSC Console
========================

WNG Front End HTML and CSS for CSC Console

Steps to install
===================
- Install Node on your machine (download from http://nodejs.org/)
- Install Ruby (http://rubyinstaller.org/)
- Start Ruby command line 
- Install the Ruby Bundler <code>gem install bundler</code>
- Install compass <code>gem install compass</code>
- Get latest code from TFS for Wng.FrontEnd
- Change to the BToB directory in frontend
- Open ruby command line and run command <code>bundle install</code>
- Open windows command line and install global node packages with command <code>npm -g install grunt-cli bower</code>
- Install local node packages by then running this from the command line <code>npm install</code>
- Double click on start.cmd
- Open browser and navigate to http://localhost:9000/<page>.html

Karma installation and execution:
npm install -g karma --msvs_version=vs2013
npm install -g karma-jasmine
npm install -g karma-chrome-launcher

grunt karma:unit:start watch


Notes specific to CSC
=====================
grunt build          // (points to ins-admin / CSC)

Notes
==================
- HTML pages should have this on the last line before closing body tag

    <script src="http://localhost:35729/livereload.js"></script>

- We are using Autoprefixer to post process the CSS so prefixes are turned off with Compass by adding this:

$experimental-support-for-mozilla : false !default;
$experimental-support-for-webkit : false !default;
$support-for-original-webkit-gradients : false !default;
$experimental-support-for-opera : false !default;
$experimental-support-for-microsoft : false !default;
$experimental-support-for-khtml : false !default;


Notes on the CSC Refactor
=========================
- Basic components are
  - Make JSON call to get transactional data. With existing services that means all the data especially if we want to avoid session
  - Make JSON call to get reference data.
  - Load the HTML page template for that step in the purchase path
  - User enters some data
  - Validate the data, and show validation messages
  - Save the data, either implicitly or explicitly between pages
  - Handle notifications of errors in server communication
  - Manage the flow between different stages of the purchase path - can the user step back and forward

- Look at using some validation extension e.g. https://github.com/AngularAgility/AngularAgility/blob/master/src/aa.formExtensions.js

- Need to handle merging with sub level models rather than just newing up models on every save

- Saving data
    - service.data owns the dto
    - service.options owns the model
    - user makes a change on scope of options view
    - modifies the model
    - watch results in call to save data - could use pubsub to flag this initial request
    - really want central queue for data save requests, but also want service.options to own the queue 
      so that it can call the save and then update the model on success