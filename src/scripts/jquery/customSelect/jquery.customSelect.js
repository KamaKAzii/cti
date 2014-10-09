/*

jQuery.customSelect.js by Jaidev Soin

Version 1

*/

// This plugin allows you to easily change a select element into an autocompelter that behaves similar to a select

// Data attached to the customSelect element that might be useful
// - 'lastChosenItem' - The data for the last item that was selected
// - 'input' - A reference to the jQuery object for the input that is created

// Possible things to add down the line
// - Grouping - Perhaps change how autocompelter does it too
// - Clear the selected option if the text is removed

(function ($) {
  $.fn.extend({
    customSelect: function (opt) {
      opt = $.extend({
        firstItemIsPlaceholder: true,    // Whether the first option's text should be the placeholder
        id: null,                        // HTML id of the autocompleters input
        insertOpenButton: function(openButton, input) {  // Where the open button for the customSelect is inserted, default is just after the input
          openButton.insertAfter(input);
        },
        openButton: $('<a/>', {  // jQuery element representing the open button
          'class': 'custom-select-open',
          'text': 'View items'
        }),
        additionalDataAttributesToTrack: []  // by default data-sort and data-aliases will be extracted from the option and stored in data('lastChosenItem'). Supply additional attributes without the data- prefix
      }, opt);

      var utils = {
        getItemsFromSelect: function(select) {
          return $.map(select.children(), function(option, i) {
            var rawAliases = option.getAttribute('data-aliases');

            var item = {
              'id': option.value,
              'name': option.text,
              'sort': Number(option.getAttribute('data-sort') || i),
              'aliases': (rawAliases ? rawAliases.split('|') : null)
            }

            $.each(opt.additionalDataAttributesToTrack, function(i, attribute) {
              item[attribute] = option.getAttribute('data-' + attribute);
            });

            return item;
          });
        },
        findItemById: function(id, items) {
          var matches = $.grep(items, function(item) {
            return item.id == id;
          });

          return matches.length > 0 ? matches[0] : null;
        }
      };

      return this.each(function () {
        var input;

        var self = $(this)

          .bind('init.customSelect', function () {
            self
              .hide()
              .triggerHandler('setUpAutocompleter');
          })

          .bind('setUpAutocompleter', function() {
            var items = utils.getItemsFromSelect(self);

            if (opt.openButton) {
              var openButton = opt.openButton;
            }

            if (opt.firstItemIsPlaceholder) {
              var placeholder = items.shift()['name'];
            }

            input = $('<input />', {
              'autocomplete': 'off',
              'tabindex': self.attr('tabindex'),
              'id': opt.id
            })
            .placeholderPlus(placeholder || '')
            .insertAfter(self)
            .autocomplete(items, {
              exactMatchSeperatorRegex: null,
              selectedID: self.val(),
              ignoreClicksOn: openButton,
              focusNextFieldOnItemSelect: true
            })
            .bind('itemChosen', function(e, data, textuserEntered) {
              self.val(data.id);
              self.data('lastChosenItem', data);
              input.triggerHandler('setDefaultValue', [data.name]);
              input.triggerHandler('setSelectedID', [data.id]);
            });

            var selectedItem = utils.findItemById(self.val(), items);

            if (selectedItem) {
              self.data('lastChosenItem', selectedItem);
            }

            self.data('input', input);

            // Check to see if anything is selected already that is not the placeholder, and if so, set it on the input.
            var selected = self.find('option:selected');

            if (selected.text() != placeholder) {
              input.triggerHandler('setDefaultValue', selected.text());
            } 

            if (openButton) {
              opt.insertOpenButton(openButton, input);

              openButton
                .bind('click', function() {
                  if (input.data('autocompleter')) {
                    input.blur().triggerHandler('removeAutocompleter');
                  } else {
                    input.trigger('focus');
                  }
                })
                // Note: I'm not 100% sure this is required, this may be a left over from when this code had to run on jQuery 1.4.4
                .bind('mousedown', function() {
                  return false;
                })
            }
          });


        self.triggerHandler('init.customSelect');
      });
    }
  });
})(jQuery);
