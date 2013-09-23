/*!
 * jQuery smartModal
 * 
 * Version: 2.1.0
 * Author: Ben Marshall
 * Author URL: http://www.benmarshall.me
 * jQuery Plugin URL: http://plugins.jquery.com/smartModal/
 * Plugin URL: http://www.benmarshall.me/jquery-smartmodal/
 * GitHub: https://github.com/bmarshall511/jquery-smartModal
 * 
 * Licensed under the MIT license
 */
/*jslint browser: true, devel: true, indent: 2 */

(function ($) {
  "use strict";

  var settings = {
    overlayDelay: 300,
    hideDelay: 300,
    cookieExpires: 365,
    debug: false,
    clickClose: true,
    animationDuration: 800,
    animationEasing: 'linear',
    gaTracking: false,
    shortkeys: true
  },
    storageEnabled = false,
    cookiesEnabled = false,
    gaEnabled = false,
    numModals = 0,
    timeouts = [],
    intervals = [],
    modalIDs = [],
    overlay = $('<div />').addClass('smartmodal-overlay').attr('id', 'smartmodal-overlay').css('display', 'none'), // Build the modal overlay.
    methods = {
      // Initialize the plugin
      'init': function () {
        // Check if GA is enabled
        if (settings.gaTracking) {
          if (typeof(_gaq) !== 'undefined') {
            gaEnabled = true;
          } else {
            if (settings.debug) {
              console.log('GA not loaded. Tracking disabled.');
            }
          }
        }

        // Check if web storage is supported
        if (window.localStorage) {
          storageEnabled = true;
        } else {
          if (settings.debug) {
            console.log('Web storage not supported. Using jQuery.cookie plugin.');
          }
        }

        // Check if the jQuery.cookie plugin has been loaded
        if ($.cookie) {
          cookiesEnabled = true;
        } else {
          if (settings.debug) {
            console.log('jQuery.cookie plugin not loaded. Cookies have been disabled.');
          }
        }

        // Set the number of modals that appear on the page
        methods.countModals();

        // Setup the modals
        methods.setupModals();

        // Listen for events
        methods.eventHandler();
      },
      // Show the modal
      'showModal': function (id) {
        var modal = $('#' + id),
          animated = false,
          easing = settings.animationEasing,
          time = settings.animationDuration,
          animationStart,
          animationArray,
          autoclose = true,
          expires = settings.cookieExpires; // set the default time until a cookie expires;

        // Check to ensure the modal exists
        if (!modal.length) {
          if (settings.debug) {
            console.log('#' + id + ' not found.');
          }
          return false;
        }

        // Style and position the modal
        modal.addClass('smartmodal-modal');
        methods.positionModal(id);

        // Check if the overlay is already on the page
        if (!$('#smartmodal-overlay').length) {
          $('body').append(overlay);
        }

        // Check if the modal should be animated
        if (modal.data('animation')) {
          // Check if multiple parameters
          if (modal.data('animation').indexOf('|') >= 0) {
            animationArray = modal.data('animation').split('|');
            if (animationArray[0]) {
              animationStart = animationArray[0];
            }
            if (animationArray[1]) {
              easing = animationArray[1];
            }
            if (animationArray[2]) {
              time = parseInt(animationArray[2], 10);
            }
          } else {
            animationStart = modal.data('animation');
          }

          animated = true;
          methods.positionModal(id, animationStart);
        }

        // Display the modal
        overlay.fadeIn(settings.overlayDelay);
        if (animated) {
          modal.show().animate({
            left: methods.calculatePos(modal, 'left'),
            top: methods.calculatePos(modal, 'top')
          }, {
            duration: time,
            specialEasing: {
              top: easing
            }
          });
        } else {
          modal.fadeIn(settings.overlayDelay);
        }

        // Send event to Google Analytics if set
        if (gaEnabled && modal.data('name')) {
          methods.gaTrackEvent('jQuery.smartModal', modal.data('name'), 'Opened');
        }

        // Check if a timed modal
        if (modal.data('time')) {
          // Check if autoclose has been disabled
          if (modal.data('close') && modal.data('close') === 'manual') {
            autoclose = false;
            $('.close', modal).hide();
          }

          if (autoclose) {
            // Set a timeout
            timeouts[id] = window.setTimeout(function () {
              // Check if a sticky modal
              var isSticky = false;
              if (modal.hasClass('sticky')) {
                modal.removeClass('sticky');
                isSticky = true;
              }
              methods.closeModal(id);

              // If sticky, make it sticky again
              if (isSticky) {
                modal.addClass('sticky');
              }
            }, (modal.data('time') * 1000));
          }

          // Check if seconds should be displayed in the modal
          if ($('.sec', modal).length) {
            // Show the starting time
            $('.sec', modal).text(modal.data('time'));

            // Set an interval for the countdown
            intervals[id] = window.setInterval(function () {
              var sec = parseInt($('.sec', modal).text(), 10) - 1;
              if (sec >= 0) {
                $('.sec', modal).text(sec);
              } else {
                // Check if autoclose has been disabled, if so show the close trigger
                if (!autoclose && $('.close', modal).is(':hidden')) {
                  // Check if timed sticky, if so make it unsticky
                  if (modal.hasClass('sticky') && modal.data('time')) {
                    modal.removeClass('sticky').addClass('wasSticky');
                  }
                  $('.close', modal).show();
                }
                window.clearInterval(intervals[id]);
              }
            }, 1000);
          }
        }

        // Check if the modal should only be shown once
        if (modal.hasClass('once')) {
          // Use web storage if supported
          if (storageEnabled) {
            localStorage['smartModal-' + id] = 'shown';
          } else if (cookiesEnabled) {
            // Check if modal has specified cookie expire limit
            if (modal.data('expires')) {
              expires = modal.data('expires');
            }

            // Set the cookie.
            $.cookie('smartModal-' + id, 'shown', { 'path' : '/', 'expires' : expires });
          }
        }
      },
      // Close a modal
      'closeModal': function (id) {
        // Check to make sure the modal exists
        if ($('#' + id).length) {
          var modal = $('#' + id);

          // Check if it's a sticky modal
          if (!modal.hasClass('sticky')) {
            // Check if modal was a sticky, if so, make it sticky again
            if (modal.hasClass('wasSticky')) {
              modal.removeClass('wasSticky').addClass('sticky');
            }

            // Check if a interval for the modal has been set
            if (intervals[id]) {
              window.clearInterval(intervals[id]);
            }

            // Check if a timeout for the modal has been set
            if (timeouts[id]) {
              window.clearTimeout(timeouts[id]);
            }

            modal.fadeOut(settings.hideDelay, function () {
              // Make sure no other modals are active before removing the overlay
              if (!$('.smartmodal-modal:visible').length) {
                methods.removeOverlay();
              }
            });

            // Send event to Google Analytics if set
            if (gaEnabled && modal.data('name')) {
              methods.gaTrackEvent('jQuery.smartModal', modal.data('name'), 'Closed');
            }
          }
        }
      },
      // Remove the modal overlay
      'removeOverlay': function () {
        if ($('#smartmodal-overlay').length) {
          $('#smartmodal-overlay').fadeOut(settings.hideDelay, function () {
            $(this).remove();
          });
        }
      },
      // Position the modal
      'positionModal': function (id, start) {
        if (id) {
          // Check to make sure the modal exists
          if ($('#' + id).length) {

            // Get the modal
            var modal = $('#' + id);

            if (start) {
              switch (start) {
              case 'top':
                modal.css({
                  'top': -(modal.height()),
                  'left': methods.calculatePos(modal, 'left')
                });
                break;
              case 'bottom':
                modal.css({
                  'top': $(window).height() + modal.height(),
                  'left': methods.calculatePos(modal, 'left')
                });
                break;
              case 'left':
                modal.css({
                  'top': methods.calculatePos(modal, 'top'),
                  'left': -(modal.width())
                });
                break;
              case 'right':
                modal.css({
                  'top': methods.calculatePos(modal, 'top'),
                  'left': $(window).width() + modal.width()
                });
                break;
              }
            } else {
              // Center the modal
              modal.css({
                'top': methods.calculatePos(modal, 'top'),
                'left': methods.calculatePos(modal, 'left')
              });
            }
          }
        }
      },
      'calculatePos': function (modal, pos) {
        // Get the window's dimisions
        var width = $(window).width(), // Get the window's width
          height = $(window).height(), // Get the window's height
          mwidth = modal.width(), // Get the modal's width
          mheight = modal.height(); // Get the modal's height

        switch (pos) {
        case 'left':
          return (width - mwidth) / 2;
        case 'top':
          return (height - mheight) / 2;
        }
      },
      // // Counts the number of modals on the page
      'countModals': function () {
        numModals = $('.smartmodal').length;
        if (settings.debug) {
          console.log(numModals + ' modals found.');
        }
      },
      'eventHandler': function () {
        // Check if shortkeys are enabled
        if (settings.shortkeys) {
          // Listen for ESC key.
          $(document).keyup(function (e) {
            if (e.keyCode === 27) { // esc
              $.each($('.smartmodal-modal'), function () {
                if (!$(this).hasClass('sticky')) {
                  var id = $(this).attr('id');

                  methods.closeModal(id);
                }
              });
            }
          });
        }

        // Listen when the close trigger is clicked
        $('.smartmodal .close').bind("click", function () {
          var id = $(this).closest('.smartmodal').attr('id');
          methods.closeModal(id);
        });

        // Listen for window resize
        $(window).resize(function () {
          $.each($('.smartmodal'), function () {
            var id = $(this).attr('id');
            methods.positionModal(id);
          });
        });

        // Check if clicking on the overlay to close is enabled
        if (settings.clickClose) {
          $('body').delegate("#smartmodal-overlay", "click", function (e) {
            e.preventDefault();
            $.each($('.smartmodal-modal'), function () {
              methods.closeModal($(this).attr('id'));
            });
          });
        }
      },
      // Setup the modals
      'setupModals': function () {
        // Find and initialize all modals
        $('.smartmodal').each(function () {
          var modal = $(this), // Get the modal
            c = true,
            id,
            i;

          // Check to ensure each modal has an ID, if not, assign one
          if (!modal.attr('id')) {
            while (c) {
              i = 'SM-' + Math.floor((Math.random() * numModals) + 1);
              if (!$('#' + i).length) {
                modal.attr('id', i);
                c = false;
              }
            }
          }

          id = modal.attr('id'); // Get the modal id

          // Check if duplicate IDs exist
          if ($.inArray(id, modalIDs) > -1) {
            if (settings.debug) {
              console.log(' Multiple #' + id);
            }
          }
          modalIDs.push(id);

          // Hide smartModals by default.
          modal.hide();

          // Check if modal should appear automagically
          if (modal.hasClass('once')) {
            // First, check web storage
            if (storageEnabled) {
              if (localStorage['smartModal-' + id] === 'shown') {
                modal = false;
                methods.countModals();
              }
            // If web storage isn't supported, check cookies
            } else if (cookiesEnabled) {
              if ($.cookie('smartModal-' + id) === 'shown') {
                modal = false;
                methods.countModals();
              }
            }
          }

          // Check if it's an active modal.
          if (modal) {
            // Check if the modal should popup automagically
            if (modal.hasClass('auto')) {
              // Check if a timer has been set to show the modal
              if (modal.data('wait')) {
                // Set the timeout
                setTimeout(function () {
                  methods.showModal(id);
                }, (modal.data('wait') * 1000));
              } else {
                // Show the modal as soon as the page has loaded
                methods.showModal(id);
              }
            }
          }

          // Check if a modal trigger is on the page
          if ($('.' + id).length) {
            // Bind the modal trigger to the click event
            $('.' + id).bind('click', function (e) {
              e.preventDefault();
              methods.showModal(id);
            });
          }
        });
      },
      // Google Analytics event tracking (https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)
      'gaTrackEvent': function (category, action, label, value) {
        if (gaEnabled) {
          _gaq.push([
            '_trackEvent', category, action, label, value
          ]);
        }
      }
    };

  $.smartModal = function (options, id) {
    if (typeof options === 'object') {
      settings = $.extend(settings, options);
      methods.init();
    } else if (typeof options === 'string' && typeof id === 'string') {
      switch (options) {
      case 'show':
        methods.showModal(id);
        break;
      case 'hide':
        methods.closeModal(id);
        break;
      default:
        if (settings.debug) {
          console.log(options + 'not valid.');
        }
        break;
      }
    } else if (typeof options === 'string' && typeof id === 'object') {
      switch (options) {
      case 'init':
        if (id) {
          settings = $.extend(settings, id);
        }
        methods.init();
        break;
      case 'settings':
        settings = $.extend(settings, id);
        break;
      default:
        if (settings.debug) {
          console.log(options + ' not valid.');
        }
        break;
      }
    } else {
      methods.init();
    }
  };
}(jQuery));
