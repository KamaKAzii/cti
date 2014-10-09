$(function() {

  var $countryPickerUberMenu = null;

  var countryGroupsArray = [{"name":"Americas","countries":["United States","Canada"]},{"name":"Asia","countries":["Thailand","Bali","Vietnam","Indonesia","Malaysia","Singapore","Hong Kong","Japan"]},{"name":"Europe","countries":["United Kingdom","France","Germany","Italy","Spain","Netherlands","Switzerland"]},{"name":"Pacific","countries":["Australia","New Zealand","Fiji","Vanuatu"]},{"name":"Africa","countries":["South Africa"]}]
  var $countryPickerUberMenu = $("<div/>").addClass("uber-menu");
  var $countryPickerUberMenuHeader = $("<h2/>").html("<span>Select</span> or <span>type</span> the country name");
  var $countryPickerUberMenuFooter = $("<div/>").addClass("uber-menu-footer").html("<span>Can't find the country in this list?</span> Type in the country name in the box above.");
  var $countryPickerUerMenuClose = $("<button/>").addClass("button-tertiary close").html("<span>&#xe010;</span>");
  var $groupsUl = $("<ul/>").addClass("groups");
  $countryPickerUberMenu.append($countryPickerUberMenuHeader);
  $countryPickerUberMenu.append($groupsUl);
  $countryPickerUberMenu.append($countryPickerUberMenuFooter);
  $countryPickerUberMenu.append($countryPickerUerMenuClose);
  for (i = 0; i < countryGroupsArray.length; i++)
  {
    var $groupsLi = $("<li/>").addClass("group");
    var $groupHeader = $("<h3/>").html(countryGroupsArray[i]["name"]);
    var $countriesUl = $("<ul/>").addClass("countries");
    for (j = 0; j < countryGroupsArray[i]["countries"].length; j++)
    {
      var $countryLi = $("<li/>").addClass("country").html(countryGroupsArray[i]["countries"][j]);
      $countriesUl.append($countryLi);
    }
    $groupsUl.append($groupsLi);
    $groupsLi.append($groupHeader);
    $groupsLi.append($countriesUl);
  }

  $('.int-domestic .hidden-country-ids').removeAttr('disabled');
  $('.int-domestic #quote-destination select').attr('disabled', 'disabled');

  // Setup item picker
  $(".qqc .where select").dropdownPicker(
    $(".int-domestic #quote-destination input"),                           // $pickerAddButton
    $(".int-domestic .hidden-country-ids"),                                // $hiddenSelectedItemsInput
    $(".int-domestic #selected-destinations"),                             // $selectedItemsElement
    {
      instructions: $countryPickerUberMenu
    }
  ).on("autocomplete.instructionsShown", function (e, element) {
    var $uberMenu = element;
    var $pickerInput = $(e.target).data("pickerInput");
    $uberMenu.find(".country").on("click", function () {
      $pickerInput.val($(this).html()).trigger("findExactMatches");
    });
    $uberMenu.find(".close").on("click", function () {
      $pickerInput.trigger("removeInstructions");
    });
  });

  // Setup date pickers
  var $departureDateDay = $(".int-domestic .departure-date select").eq(0);    // departureDateDay
  var $departureDateMonth = $(".int-domestic .departure-date select").eq(1);  // departureDateMonth
  var $departureDateYear = $(".int-domestic .departure-date select").eq(2);   // departureDateYear
  var $returnDateDay = $(".int-domestic .return-date select").eq(0);          // returnDateDay
  var $returnDateMonth = $(".int-domestic .return-date select").eq(1);        // returnDateMonth
  var $returnDateYear = $(".int-domestic .return-date select").eq(2);         // returnDateYear

  var maxTimeUntilPolicyStart = { years: 1 };
  var maxPolicyDurations = { 'IHI': { days: 365 }, 'Millstream': { days: 372 } };

  var dateIncrementFunction = function (period) {
    // Currently this just deals with days, months, and years. If you wanted to deal with a more complex caculation, I suggest
    // allowing the passed in date to be either an object of this form, or a function.
    return function (startDate) {
      var year = startDate.getFullYear() + (period.years || 0);
      var month = startDate.getMonth() + (period.months || 0);
      var day = startDate.getDate() + (period.days || 0) - 1;

      return new Date(year, month, day);
    };
  };
  // Looks at all the passed in underwriter durations, returns a function that increments
  // a given date by the largest duration
  var largestUnderwriterDateIncrementFunction = function () {
    var today = new Date();
    return longest = $.map(maxPolicyDurations, function (duration) {
      return dateIncrementFunction(duration);
    }).sort(function (a, b) {
      return b(today) - a(today);
    })[0];
  };

  var $departureDateInput = $('<input/>', {
    'type': 'text',
    'autocomplete': 'off',
    'class': "departure-date-input",
    'id': "departure-date-input"
  }).insertAfter($departureDateYear);

  var $returnDateInput = $('<input/>', {
    'type': 'text',
    'autocomplete': 'off',
    'class': "return-date-input",
    'id': "return-date-input"
  }).insertAfter($returnDateYear);

  $departureDateInput.datePickerForSelects($departureDateDay, $departureDateMonth, $departureDateYear, {
    panelCloseClass: 'close',
    alignment: 'left',
    preventManualEntry: true,
    dateFormat: 'ddd mmmm yyyy',
    companionPicker: $returnDateInput,
    headerText: "<strong>Select</strong> your <strong>departing</strong> date",
    maxDate: dateIncrementFunction(maxTimeUntilPolicyStart)(new Date()),
    numberOfMonths: 1
  });

  $returnDateInput.datePickerForSelects($returnDateDay, $returnDateMonth, $returnDateYear, {
    panelCloseClass: 'close',
    alignment: 'left',
    preventManualEntry: true,
    dateFormat: 'ddd mmmm yyyy',
    companionPicker: $departureDateInput,
    useCompanionDateAsMin: true,
    startCalendarAtCompanionDate: true,
    delayHideOnSelectBy: 500,
    calculateMaxDateBasedOnCompanion: largestUnderwriterDateIncrementFunction(),
    headerText: "<strong>Select</strong> your <strong>returning</strong> date",
    numberOfMonths: 1
  });

});
