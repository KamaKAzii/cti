jQuery.fn.popup = function (options) {
  var defaults = {
    preventDefault: true,
    popupEvent: 'click',
    appendToElement: 'body',
    popupDivId: 'javascript-popup',
    popupDiv: $("<div class=\"javascript-popup\"></div>"),
    contentDiv: $("<div class=\"javascript-popup-content\"></div>"),
    overlayPage: true,
    overlayDiv: $("<div class=\"javascript-popup-overlay\"></div>"),
    close: $("<button class='button-tertiary close'><span>&#xf00d;</span></button>"),
    respondToEsc: true
  };

  var opts = $.extend(defaults, options);
  
  $(this).click(function (e) {
    if (opts.preventDefault) {
      e.preventDefault();
    }

    if (opts.popupDivId != null && opts.popupDivId != undefined) {
      opts.popupDiv.attr('id', opts.popupDivId);
      opts.contentDiv.attr('id', opts.popupDivId + "-content");
    }

    opts.contentDiv.load(opts.url, function () {
      if (opts.overlayPage == true) {
        opts.overlayDiv.appendTo(opts.appendToElement);
      }

      var escapeHandler = function (keyup) {
        if (keyup.which == 27) {
          opts.close.click();
        }
      };

      if (opts.respondToEsc) {
        $(opts.appendToElement).bind('keyup', escapeHandler);
      }

      opts.close.appendTo(opts.contentDiv);
      opts.close.click(function () {
        $(opts.appendToElement).unbind('keyup', escapeHandler);
        opts.popupDiv.remove();
        opts.overlayDiv.remove();
      });
    }).appendTo(opts.popupDiv);

    opts.popupDiv.appendTo(opts.appendToElement);
    return opts.popupDiv.attr('id');
  });


}