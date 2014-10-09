$(function() {

  if ($(".mobile-landscape-visibility-check").is(":visible")) {

    var
    $summaryAside,
    $summaryAsideMobileToggle;

    $summaryAsideMobileToggle = $(".summary-aside-mobile-toggle");
    $summaryAside = $(".summary-aside");

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
