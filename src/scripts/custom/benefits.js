$(function() {

  var
  $benefitsList,
  $topBenefits,
  $topBenefitDescriptions,
  $benefitHeaders;

  $benefitsList = $(".benefits-list");
  $topBenefits = $benefitsList.find(".top-benefit");
  $topBenefitDescriptions = $benefitsList.find(".top-benefit > .description");
  $benefitHeaders = $benefitsList.find(".top-benefit > .benefit-header");

  $topBenefitDescriptions.hide();

  $benefitHeaders.on("click", function(e) {
    $(this).toggleClass("open");
    $(this).siblings(".description").toggle();
  });


});
