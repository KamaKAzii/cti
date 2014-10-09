/*

jquery.WNQuotePanel.js by Jaidev Soin

Version 1

What plugin does: Provides interactions between the page and the datepicker / autocompleter plugins, and provides analytics logging.

Dependencies: jquery.autocompleteWithPanel.js, jquery.autocomplete.js, jquery.datePickerForSelects.js, jquery.datePicker.js, google_analytics.js.

Triggers you might want to listen for:

displayCountry.where(country)
displayError(input, message, fieldIdentifier)
  
Triggers you might want to use yourself:
 
addCountry.where(country, alias)
removeError(input)
 
Validations performed by this plugin:
Displays an error if the user enters a country it does not recognise
Displays an error if the user tried to add a world region
Displays an error if the user submits the form with no countries added (after checking for text in the country input and trying to add it as a country if present)
Will not allow submission of the form if any errors that it inserted are present
Note: Country errors are cleared when the user focuses on the country input

Naming conventions for the various country data:
Any country data relating to the hidden country input is labeled as such, eg: hiddenCountriesData, or countryFromHiddenInput. This is of the form { id: id, alias: (optional)'alias' }
Anything labeled as "country" is of the form { id: id, name: 'name', aliases: [aliases] }

Destination, residence and province data to be passed in:
- Destinations supplied in a <select> with option format <option val='ID' data-sort='(optional)SORT_INDEX' data-aliases='(optional)ALIASES_DELIMITED_BY_|'>COUNTRY_NAME</option>
- Residence supplied in a <select> with option format <option val='ID' data-sort='(optional)SORT_INDEX' data-underwriter='UNDERWRITER_ID'>COUNTRY_NAME</option>
- Each province supplied in a <select data-country-of-residence-id='COUNTRY_ID'> with option format <option val='ID' data-sort='(optional)SORT_INDEX'>PROVINCE_NAME</option>

Durations:
- Durations are supplied as an object of the form of { years: x, months: y, days: z }
- Only one key/value pair required, but works with all 3
- Increments dates by this value in an inclusive fashion
- Months are incremented based on the calendar, so one month from the 4th March is the 3rd of April (calculated as the 4th of April, -1 day for inclusive)

TODO:
- Might need some extra custom code to handle any validations on the page when this loads - might not, we will see!

*/

(function ($) {

    // Note: these custom errors will only trigger if there is an error in the first place.
    // This means that if the quote panel has a country called "asia" there will be no error.
    var customErrorLocations = {
        "europe": "Europe",
        "pacific": "the Pacific",
        "south pacific": "South Pacific",
        "south america": "South America",
        "north america": "North America",
        "asia": "Asia"
    };

    $.fn.extend({
        WNQuotePanel: function (destinationSelect, destinationAdd, hiddenSelectedCountriesInput, residenceSelect, provinceSelects, provinceElementsContainerSelector, departureDateDay, departureDateMonth, departureDateYear, returnDateDay, returnDateMonth, returnDateYear, singleRadio, singleElements, coupleRadio, coupleElements, familyRadio, familyElements, selectedCountriesElement, maxTimeUntilPolicyStart, maxPolicyDurations, opt) {
            opt = $.extend({
                noDestinationsAddedErrorMessage: "Please enter in a country you are travelling to.", // Error displayed if the user submits the quote without adding a country
                noResidenceSelectedErrorMessage: "Please select your country of residence.", // Error displayed if a user submits a quote without selecting a country of residence                     
                noProvinceSelectedErrorMessage: "Please select your province.", // Error displayed if a user submits a quote with a provincial country, but no province (may want to make this message generic to handle "state" at some point)
                cantFindCountryErrorMessage: "Sorry, we don't recognise this country (#{country}). Please try again.",  // Error displayed when the country selector can't find a country user entered
                cantFindProvinceErrorMessage: "Sorry, we don't recognise this province (#{province}). Please try again.", // Error displayed when the province selector can't find supplied province
                cantFindRegionErrorMessage: "Please enter which countries in #{region} you are travelling to",          // Error displayed when the country selector knows the user tried to add a region
                panelAlignment: 'left',                     // On which side of the inputs should the autocompleter and date picker align themselves to?
                hiddenInputCountryDelimiter: '|',           // Seperates countries within the hidden input
                hiddenInputAliasDelimiter: ':',             // Seperates country ids from aliases within the hidden country input
                destinationInputId: 'destination-autocomplete', // Id of the country selector input field
                destinationInputClass: 'destination-autocomplete',// Class to apply to the country input field
                destinationInputTabIndex: 1,                // Tab index of the country selector input
                residenceInputId: 'residence-autocomplete', // Id of the residence selector input field
                residenceInputClass: 'residence-autocomplete',// Class to apply to the residence input field
                residenceInputTabIndex: null,                // Tab index of the residence selector input
                departureDateInputId: 'departure-date',     // Id of the departure date input field
                departureDateInputClass: 'departure-date',  // Class to apply to the departure date input field
                departureDateInputTabIndex: null,           // Tab index of the departure date input
                returnDateInputId: 'return-date',           // Id of the return date input field
                returnDateInputClass: 'return-date',        // Class to apply to the return date input field
                returnDateInputTabIndex: null,              // Tab index of the return date input. null indicates that no index be set.
                departureDateInputHeaderText: "<strong>Select</strong> your <strong>departing</strong> date", // Header to put on the departure date datepicker
                returnDateInputHeaderText: "<strong>Select</strong> your <strong>returning</strong> date",    // Header to put on the return date datepicker
                anchorAutocompleterTo: null,                 // Element to anchor the autocompleter / country picker to - if null defaults to input
                preventManualEntryOnDatePickers: true,       // Prevents manual date entry on datepickers
                dateFormat: 'ddd mmmm yyyy',                 // Date format of 1st Jan 2012
                onSubmitCallback: null,                      // Callback to be fired on submit after all validation hav been passed. Return value affects submit action.
                underwritersWithoutCouples: [],              // Underwriters that don't support the couples option
                aliasDelimiter: '|',                         // Delimiter used to split the aliases found in the data attribute on destination / residence selects 

                // Insert a country error message into the page. By default, this packages the error message into a ul and inserts it after the input
                //    errorMessage: a country error message to display.
                //    destinationInput: the input that autocompleteWithPanel will be applied to
                //    fieldIdentifier: string representing the field the error is being displayed for. Can be destination, departure-date, return-date
                insertError: function (errorMessage, input, fieldIdentifier) {
                    var error = $(utils.sub("<ul class='input-validation-errors'><li><span>#{message}</span></li></ul>", {
                        message: errorMessage
                    }));
                    error.insertAfter(input).hide().fadeIn();
                    return error;
                },

                // Translate from the passed in countries array (structured for efficiency) to something the autocompleter can understand (structured for readbility)
                //    rawCountries: an array of raw countries
                countriesFromRaw: function (rawCountries) {
                    return $.map(rawCountries, function (raw) {
                        return { 'id': raw[0], 'name': raw[1], 'aliases': raw[2] || null };
                    });
                },

                // Template for displaying a country that the user has selected, this forms the content of an li which is appended to the selectedCountriesElement
                //    country: a country hash, the same as what was created by countriesFromRaw
                //    alias: (optional) the alias that matches what the user was searching for
                addedCountryListItemTemplate: function (country) {
                    return utils.sub("#{name}#{aliasOrBlank}<a>&times;</a>", {
                        name: country['name'],
                        aliasOrBlank: country['matchedAlias'] ? utils.sub(' (#{alias}) ', { alias: country['matchedAlias'] }) : ' '
                    });
                },

                autocompleteOptionsOverride: {}, // Should not normally be required, only for forcing custom behavior in non-standard cases
                departingDatePickerOptionsOverride: {},   // Should not normally be required, only for forcing custom behavior in non-standard cases
                returningDatePickerOptionsOverride: {}    // Should not normally be required, only for forcing custom behavior in non-standard cases
            }, opt);

            var utils = {
                // Simple token substitution method for building strings. Usage is of the format: sub("Substitution is #{adjective}", { 'adjective': 'awesome'})
                sub: function (html, values) {
                    return html.replace(/#\{(\w*)\}/g, function (token, key) {
                        return values[key] || token;
                    });
                },

                countriesFromOptions: function (options) {
                    return $.map(options, function (option) {
                        return {
                            'id': option.value,
                            'name': option.text,
                            'sort': Number(option.getAttribute('data-sort')),
                            'aliases': (option.getAttribute('data-aliases') ? option.getAttribute('data-aliases').split(opt.aliasDelimiter) : null)
                        }
                    });
                },

                // Looks up a country by ID from a supplied country list
                getCountryByID: function (id, countries) {
                    for (var i = 0; i < countries.length; i++) {
                        if (countries[i]['id'] == id) {
                            return countries[i];
                        }
                    }

                    return null;
                },

                /*
                The following utilities are all for modifying the data stored in the hidden country input. This input is
                the record of what countries (and their aliases) the user has nominated they are going to.
                */

                // Adds a country ID and alias (if required) to the hidden input containing what contries the user has selected
                addCountryToHiddenInput: function (countryToAdd) {
                    var hiddenCountriesData = utils.readFromHiddenInput();
                    hiddenCountriesData.push({ 'id': countryToAdd['id'], 'alias': countryToAdd['matchedAlias'] });

                    utils.writeOutToHiddenInput(hiddenCountriesData);
                },

                // Removed a country from the hidden input containing what countries the user has selected
                removeCountryFromHiddenInput: function (countryToRemove) {
                    utils.writeOutToHiddenInput($.grep(utils.readFromHiddenInput(), function (country) {
                        return country['id'] != countryToRemove['id'];
                    }));
                },

                // Returns a count of countries in the hidden input, thus the nunber of countries the user has selected
                numberOfCountriesInHiddenInput: function () {
                    return utils.readFromHiddenInput().length;
                },

                // Tests if a specific country has been added to the hidden input already. Lookup is based on ID, alias is ignored
                isCountryInHiddenInput: function (countryToFind) {
                    return ($.grep(utils.readFromHiddenInput(), function (country) {
                        return country['id'] == countryToFind['id'];
                    }).length > 0)
                },

                // Read countries from the hidden input. Data is in the form of { id: x, alias: y }
                readFromHiddenInput: function () {
                    var countries = [];
                    var hiddenCountriesData = hiddenSelectedCountriesInput.val();

                    if (hiddenCountriesData.length > 0) {
                        $.each(hiddenCountriesData.split(opt.hiddenInputCountryDelimiter), function (i, hiddenCountriesDataItem) {
                            var split = hiddenCountriesDataItem.split(opt.hiddenInputAliasDelimiter);
                            countries.push({ 'id': Number(split[0]), 'alias': split[1] || null });
                        });
                    }

                    return countries;
                },

                // Helper utility utilised by the other hidden input modifying utilities to write out to the hidden input.
                writeOutToHiddenInput: function (countries) {
                    hiddenSelectedCountriesInput.val($.map(countries, function (country) {
                        if (country['alias']) {
                            return country['id'] + opt.hiddenInputAliasDelimiter + country['alias'];
                        } else {
                            return country['id'];
                        }
                    }).join(opt.hiddenInputCountryDelimiter));
                },

                // Takes a time period of the form { years: x, months: y, days: z } (all values are optional) and returns a 
                // function to increment a date by time period (inclusive)
                dateIncrementFunction: function (period) {
                    // Currently this just deals with days, months, and years. If you wanted to deal with a more complex caculation, I suggest 
                    // allowing the passed in date to be either an object of this form, or a function. 
                    return function (startDate) {
                        var year = startDate.getFullYear() + (period.years || 0);
                        var month = startDate.getMonth() + (period.months || 0);
                        var day = startDate.getDate() + (period.days || 0) - 1;

                        return new Date(year, month, day);
                    }
                },

                // Looks at all the passed in underwriter durations, returns a function that increments 
                // a given date by the largest duration
                largestUnderwriterDateIncrementFunction: function () {
                    var today = new Date();
                    return longest = $.map(maxPolicyDurations, function (duration) {
                        return utils.dateIncrementFunction(duration)
                    }).sort(function (a, b) {
                        return b(today) - a(today);
                    })[0];
                },

                // Returns a jQuery object the province select with a matching data-country-of-residence-id if found, an empty element
                provinceSelectForCountryId: function (id) {
                    return $($.grep(provinceSelects, function (select) {
                        return select.getAttribute('data-country-of-residence-id') == id;
                    }));
                }
            };

            return this.each(function () {
                var destinationsPlaceholderText;

                var self = $(this)

                  .on('init.quotePanel', function () {
                      self.triggerHandler('setUpWhereTo');
                      self.triggerHandler('setUpWhereFrom');
                      self.triggerHandler('setUpWhen');
                      self.triggerHandler('setUpWho');

                      // If there was a COR when the page was loaded, set up the form appropriately
                      var selectedCountryOfResidence = residenceSelect.data('lastChosenItem');

                      if (selectedCountryOfResidence) {
                          self.triggerHandler('showProvinceFieldForCountryId', selectedCountryOfResidence.id);
                          self.triggerHandler('toggleCoupleForUnderwriter', selectedCountryOfResidence.underwriter);
                          self.triggerHandler('setMaxEndDateForUnderwriter', selectedCountryOfResidence.underwriter);
                      }
                  })

                /*
                Where to section
                */

                  // Initial setup of the destination country selector. This creates the required input and inserts it into the DOM, hides the non JS stuff, 
                  // loads any countries found in the hidden country input, and applies any required listeners.
                  .on('setUpWhereTo', function () {
                      // Get the list of countries from the select
                      var options = destinationSelect.children().toArray();
                      destinationsPlaceholderText = $(options.shift()).text();
                      var countriesWithAliases = utils.countriesFromOptions(options);

                      // Create an input to apply autocompleteWithPanel to
                      var destinationInput = $('<input/>', {
                          'type': 'text',
                          'class': opt.destinationInputClass,
                          'id': opt.destinationInputId,
                          'tabIndex': opt.destinationInputTabIndex
                      });

                      // Remove the country fields and replace with the input
                      destinationSelect.hide().after(destinationInput);
                      destinationAdd.remove();

                      // Clear country list so we can refill it
                      selectedCountriesElement.empty();

                      // Add any countries that were found in the hidden input
                      $.each(utils.readFromHiddenInput(), function (i, countryFromHiddenInput) {
                          var country = $.extend(utils.getCountryByID(countryFromHiddenInput['id'], countriesWithAliases), { 'matchedAlias': countryFromHiddenInput['alias'] });

                          if (country) {
                              self.trigger('displayCountry.where', [country, true]);
                          }
                      });

                      // Set up the autocompleter - Note placeholder plus must be applied first for correct ordering of bound focus event
                      destinationInput
                        .placeholderPlus(destinationsPlaceholderText)
                        .autocomplete(countriesWithAliases, $.extend({
                            alignment: opt.panelAlignment,
                            instructions: $("<div id='autocompleter-instructions'>Start typing a <strong>country</strong> name</div>"),
                            anchorTo: opt.anchorAutocompleterTo
                        }, opt.autocompleteOptionsOverride))

                        // Fired when the user selects something using the country selector
                        .on('itemChosen', function (e, country, textUserEntered, selectedListItem) {
                            // If the user selected from the autocompelter, log that this happened
                            if (selectedListItem) {
                                self.trigger('logToAnalytics', ["Destination - Selected an autocomplete country", 'D - ' + selectedListItem.text() + ' - ' + textUserEntered]);
                            }

                            self.trigger('addCountry.where', [country]);
                            destinationInput.val('');
                        })

                        // Listen for when find exact matches is being called, and log appropriately
                        .on('findingExactMatchesFor', function (e, text, triggeringAction) {
                            self.trigger('logToAnalytics', ["Destination - Return or tab on input no autocomplete", 'D - ' + text]);
                        })

                        // Listen for errors
                        .bind('errorFeedback.autocomplete', function (e, type, details) {
                            self.trigger('logToAnalytics', ['Destination - Failed on exact match', 'D - ' + details.join(', ').toLowerCase()]);
                            self.trigger('couldNotFindCountriesError', [details]);
                        })

                        // Clear errors when the user selects the input
                        .on('focus', function () {
                            self.trigger('removeError', [destinationInput]);
                        });

                      self.data('destinationInput', destinationInput);
                      self.trigger('addListeners.where');
                  })

                  // Add a country to the interface / form
                  .on('addCountry.where', function (e, country) {
                      if (utils.isCountryInHiddenInput(country)) {
                          self.trigger('logToAnalytics', ["Destination - Tried to re-add country", 'D - ' + country['name']]);
                      } else {
                          utils.addCountryToHiddenInput(country);
                          self.trigger('displayCountry.where', [country]);
                          self.trigger('logToAnalytics', ["Destination - Added country", 'D - ' + country['name']]);
                      }
                  })

                  // Adds a country to the "Countries you are travelling to list"
                  .on('displayCountry.where', function (e, country, noAnimation) {
                      $('<li/>')
                        .html(opt.addedCountryListItemTemplate(country))
                        .data('countryData', country)
                        .appendTo(selectedCountriesElement)
                        .hide()
                        .fadeIn(noAnimation ? 0 : 500);
                  })

                  // Add any listeners required for support of country adding / removal. 
                  .on('addListeners.where', function () {
                      // Listen for clicks on the remove link in the destination list, and remove countries as required
                      selectedCountriesElement
                        .on('click', 'a', function () {
                            var item = $(this).closest('li');
                            utils.removeCountryFromHiddenInput(item.data('countryData'));
                            self.trigger('logToAnalytics', ["Destination - Removed country", 'D - ' + item.data('countryData')['name']]);
                            item.remove();
                        });
                  })

                  // For when the contrySelector couldn't find a match for something the user entered. Checks if the string the error
                  // occured for is a custom error location, and whether it should display a custom error messgae
                  .on('couldNotFindCountriesError', function (e, countries) {
                      var countriesForError = countries.join(', ');

                      if (customErrorLocations[countriesForError.toLowerCase()]) {
                          var errorMessage = utils.sub(opt.cantFindRegionErrorMessage, {
                              region: customErrorLocations[countriesForError.toLowerCase()]
                          });
                      } else {
                          var errorMessage = utils.sub(opt.cantFindCountryErrorMessage, {
                              country: countriesForError
                          });
                      }

                      self.trigger('displayError', [self.data('destinationInput'), errorMessage, 'destination']);
                      self.data('destinationInput').val('').blur();
                  })

                /*
                Where from section
                */

                  .on('setUpWhereFrom', function () {
                      var residenceInput = residenceSelect.customSelect({
                          additionalDataAttributesToTrack: ['underwriter', 'has-provinces'],
                          id: opt.residenceInputId
                      }).data('input')
                        .addClass(opt.residenceInputClass)
                        .attr('tabIndex', opt.residenceInputTabIndex)
                        .bind('errorFeedback.autocomplete', function (e, type, country) {
                            self.trigger('logToAnalytics', ['Residence - Failed on exact match', 'R - ' + country]);
                            var errorMessage = utils.sub(opt.cantFindCountryErrorMessage, { country: country });
                            residenceInput.val('').blur();
                            self.triggerHandler('displayError', [residenceInput, errorMessage, 'residence']);
                        })
                        .bind('focus', function () {
                            self.trigger('removeError', [residenceInput]);
                        })
                        .bind('itemChosen', function (e, country, textUserEntered, selectedListItem) {
                            self.trigger('logToAnalytics', ['Residence - Selected', 'R - ' + selectedListItem.text() + ' - ' + textUserEntered]);
                            self.triggerHandler('showProvinceFieldForCountryId', country.id);
                            self.triggerHandler('toggleCoupleForUnderwriter', country.underwriter);
                            self.trigger('setMaxEndDateForUnderwriter', country.underwriter);
                        });

                      self.data('residenceInput', residenceInput);

                      var provinceInputs = $.map(provinceSelects, function (provinceSelect) {
                          var provinceInput = $(provinceSelect).customSelect().data('input')
                            .bind('errorFeedback.autocomplete', function (e, type, province) {
                                self.trigger('logToAnalytics', ['Province - Failed on exact match', 'P - ' + province]);
                                var errorMessage = utils.sub(opt.cantFindProvinceErrorMessage, { province: province });
                                provinceInput.val('').blur();
                                self.triggerHandler('displayError', [provinceInput, errorMessage, 'province']);
                            })
                            .bind('focus', function () {
                                self.trigger('removeError', [provinceInput]);
                            })
                            .bind('itemChosen', function (e, rawCountry, textUserEntered, selectedListItem) {
                                self.trigger('logToAnalytics', ['Province - Selected', 'P - ' + selectedListItem.text() + ' - ' + textUserEntered]);
                            });
                      });
                  })

                  .on('setMaxEndDateForUnderwriter', function (e, underwriter) {
                      self.data('returnDateInput').triggerHandler('setCalculateMaxDateBasedOnCompanion', utils.dateIncrementFunction(maxPolicyDurations[underwriter]));
                  })

                  .on('toggleCoupleForUnderwriter', function (e, underwriter) {
                      if ($.inArray(underwriter, opt.underwritersWithoutCouples) == -1) {
                          coupleElements.show();
                          coupleRadio.show().attr('disabled', null);
                      } else {
                          coupleElements.hide();
                          coupleRadio.hide().attr('disabled', 'disabled');

                          if (coupleRadio.prop('checked')) {
                              familyRadio.attr('checked', 'checked')
                          }
                      }
                  })

                  .on('showProvinceFieldForCountryId', function (e, countryId) {
                      var selectedCountryProvinceSelect = utils.provinceSelectForCountryId(countryId);
                      var otherSelects = provinceSelects.not(selectedCountryProvinceSelect)
                      selectedCountryProvinceSelect.closest(provinceElementsContainerSelector).show();
                      otherSelects.closest(provinceElementsContainerSelector).hide();
                  })


                /*
                When section
                */

                  // Initial setup of the date pickers. Responsible for creating the required inputs, inserting them into the DOM, and 
                  // applying the datePickerForSelects plugin to them with the required options.
                  .on('setUpWhen', function () {
                      // Create inputs to apply datePickerForSelects to
                      var departureDateInput = $('<input/>', {
                          'type': 'text',
                          'autocomplete': 'off',
                          'class': opt.departureDateInputClass,
                          'id': opt.departureDateInputId,
                          'tabIndex': opt.departureDateInputTabIndex
                      }).insertAfter(departureDateYear);

                      var returnDateInput = $('<input/>', {
                          'type': 'text',
                          'autocomplete': 'off',
                          'class': opt.returnDateInputClass,
                          'id': opt.returnDateInputId,
                          'tabIndex': opt.returnDateInputTabIndex
                      }).insertAfter(returnDateYear);

                      var commonDateOptions = {
                          panelCloseClass: opt.panelCloseClass,
                          alignment: opt.panelAlignment,
                          preventManualEntry: opt.preventManualEntryOnDatePickers,
                          dateFormat: opt.dateFormat
                      }

                      // Set up the datePickerForSelectss
                      departureDateInput
                        .datePickerForSelects(departureDateDay, departureDateMonth, departureDateYear, $.extend({
                            fieldName: 'departure date',
                            companionPicker: returnDateInput,
                            headerText: opt.departureDateInputHeaderText,
                            maxDate: utils.dateIncrementFunction(maxTimeUntilPolicyStart)(new Date())
                        }, commonDateOptions, opt.departingDatePickerOptionsOverride))

                        // Listen for invalid date error
                        .bind('displayDateError', function (e, errorMessage, dateEntered) {
                            self.trigger('displayError', [departureDateInput, errorMessage, 'departure-date']);
                        })

                        // Clear errors when a correct date has been entered
                        .bind('removeDateError', function () {
                            self.trigger('removeError', [departureDateInput]);
                        });

                      returnDateInput
                        .datePickerForSelects(returnDateDay, returnDateMonth, returnDateYear, $.extend({
                            fieldName: 'return date',
                            companionPicker: departureDateInput,
                            useCompanionDateAsMin: true,
                            startCalendarAtCompanionDate: true,
                            delayHideOnSelectBy: 500,
                            calculateMaxDateBasedOnCompanion: utils.largestUnderwriterDateIncrementFunction(),
                            headerText: opt.returnDateInputHeaderText
                        }, commonDateOptions, opt.returningDatePickerOptionsOverride))

                        // Listen for invalid date error
                        .bind('displayDateError', function (e, errorMessage, dateEntered) {
                            self.trigger('displayError', [returnDateInput, errorMessage, 'return-date']);
                        })

                        // Clear errors when a correct date has been entered
                        .bind('removeDateError', function () {
                            self.trigger('removeError', [returnDateInput]);
                        });

                      self.data('departureDateInput', departureDateInput);
                      self.data('returnDateInput', returnDateInput);
                  })

                /*
                Who section
                */

                  .on('setUpWho', function () {
                      // Ensure couple is enabled
                      coupleRadio.attr('disabled', null).show();
                      coupleElements.show();

                      // Check for clicks on each radios supporting elemnets, this is to make things such as "select radio if it's icon is clicked" easier.
                      singleElements.on('click', function () {
                          singleRadio.attr('checked', 'checked');
                      });

                      coupleElements.on('click', function () {
                          coupleRadio.attr('checked', 'checked');
                      });

                      familyElements.on('click', function () {
                          familyRadio.attr('checked', 'checked');
                      });
                  })

                /*
                General triggers section
                */

                  // Display an error message. Inserts in to the page using the callback specified in options.
                  .on('displayError', function (e, input, message, fieldIdentifier) {
                      self.trigger('removeError', [input]);
                      var error = opt.insertError(message, input, fieldIdentifier);
                      input.data('error', error);
                  })

                  // Removes an error message
                  .on('removeError', function (e, input) {
                      if (input.data('error')) {
                          input.data('error').remove();
                          input.removeData('error');
                      }
                  })

                  // Log a quote panel event to google analytics
                  .on('logToAnalytics', function (e, action, label, value) {
                      if (typeof googleAnalytics !== 'undefined') {
                          googleAnalytics.trackEvent('Quote Panel', action, { 'label': label, 'value': value, 'brand': wng.currentBrandName });
                      }
                  })

                  // Fired when the user submits the quote form. Will abort submit if validations fail.
                  .on('submit.quotePanel', function () {
                      var inputsToCheckForErrors = $.map(['destinationInput', 'residenceInput', 'departureDateInput', 'returnDateInput'], function (inputName) {
                          return self.data(inputName);
                      });

                      // If there is text in the destination input, attempt to add the country
                      if (self.data('destinationInput').val() != destinationsPlaceholderText) {
                          // Note that this will add based on the text in the autocompleter, not based on the last
                          // item the user highlighted in the autocompelter (if any). 
                          self.data('destinationInput').trigger('findExactMatches');
                      }

                      // Don't proceed if no countries selected
                      if (utils.numberOfCountriesInHiddenInput() == 0) {
                          self.trigger('displayError', [self.data('destinationInput'), opt.noDestinationsAddedErrorMessage, 'destination']);
                      }

                      // Don't proceed if no country of residence selected
                      if (!residenceSelect.data('lastChosenItem')) {
                          self.trigger('displayError', [self.data('residenceInput'), opt.noResidenceSelectedErrorMessage, 'residence']);
                      } else {
                          var currentProvinceSelect = utils.provinceSelectForCountryId(residenceSelect.data('lastChosenItem').id);

                          if (currentProvinceSelect[0]) {
                              inputsToCheckForErrors.push(currentProvinceSelect.data('input'));

                              if (!currentProvinceSelect.data('lastChosenItem')) {
                                  self.trigger('displayError', [currentProvinceSelect.data('input'), opt.noProvinceSelectedErrorMessage, 'province']);
                              }
                          }
                      }

                      // Don't proceed if there is an error message 
                      var inputsWithErrors = $.grep(inputsToCheckForErrors, function (input) {
                          return !!input.data('error');
                      });

                      if (inputsWithErrors.length > 0) {
                          return false;
                      }

                      // Finally fire onsubmit callback, the return of which affects the submit.
                      if (opt.onSubmitCallback) {
                          return opt.onSubmitCallback();
                      }
                  });

                // On plugin load, fire off init
                self.trigger('init.quotePanel');
            });
        }
    });
})(jQuery);