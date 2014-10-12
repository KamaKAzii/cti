$(function() {

  if ($(".mobile-landscape-visibility-check").is(":visible")) {

    var
    $summaryAside,
    $summaryAsideMobileToggle;

    // Normal page selector.
    $summaryAside = $(".summary-aside");
    // Payment Page selector.
    if ($summaryAside.length == 0) {
      $summaryAside = $(".trip-summary, .quote-summary-actions-wrapper, .display-container.traveller-panel");
    }

    $summaryAside.hide();

    $summaryAsideMobileToggle = $(".summary-aside-mobile-toggle");

    $summaryAsideMobileToggle.on("click", function() {
      if ($summaryAside.is(":visible")) {
        $summaryAsideMobileToggle
        .toggleClass("toggled")
        .html("Tap to expand trip details");
      } else {
        $summaryAsideMobileToggle
        .toggleClass("toggled")
        .html("Tap again to contract trip details");
      }
      $summaryAside.slideToggle({
        duration: 600
      });
    });

  }

});
