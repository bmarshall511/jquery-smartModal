/**
 * jQuery smartModal
 * 
 * Version: 1.0.3
 * Author: Ben Marshall
 * Author URL: http://www.benmarshall.me
 * Plugin URL: http://www.benmarshall.me/jquery-smartmodal/
 * GitHub: https://github.com/bmarshall511/jquery-smartModal
 * 
 * Licensed under the MIT license
 */

;(function($) {
  var settings = {
    overlayDelay: 300,
    hideDelay: 300,
    cookieExpires: 365,
    debug: false,
    shortkeys: true,
    clickClose: true
  };
  
  var storageEnabled = false,
      cookiesEnabled = false,
      numModals = 0;
      
  var timeouts = [],
      intervals = [],
      modalIDs = [];
      
  // Build the modal overlay.
  var overlay = $('<div />').addClass('smartmodal-overlay').attr('id', 'smartmodal-overlay').css('display', 'none');
  
  var methods = {
    // Initialize the plugin
    'init': function() {
      // Check is web storage is supported
      if (typeof(Storage) !== "undefined") {
        storageEnabled = true;
      } else {
        if (settings.debug) {
          console.log('smartModal Notice: Web storage is not supported. Using the jQuery.cookie plugin instead.');
        }
      }
      
      // Check if the jQuery.cookie plugin has been loaded
      if ($.cookie) {
        cookiesEnabled = true;
      } else {
        if (settings.debug) {
          console.log('smartModal Notice: The jQuery.cookie plugin could not be loaded. smartModal cookie functionality has been disabled.');
        }
      }
      
      // Set the number of modals that appear on the page
      countModals();
      
      // Listen for events
      eventHandler();
      
      // Setup the modals
      setupModals();
    },
    // Show the modal
    'showModal': function(id) {
      var modal = $('#'+id);
      
      // Check to ensure the modal exists
      if (!modal.length) {
        if (settings.debug) {
          console.log('smartModal Error: Modal (#' + id + ') not found.');
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
      
      // Display the modal
      overlay.fadeIn(settings.overlayDelay);
      modal.fadeIn(settings.overlayDelay);
      
      // Check if a timed modal
      if (modal.data('time')) {
        // Check if autoclose has been disabled
        var autoclose = true;
        if (modal.data('close') && modal.data('close') == 'manual') {
          autoclose = false;
          $('.close', modal).hide();
        }
        
        if (autoclose) {
          // Set a timeout
          timeouts[id] = window.setTimeout(function() {
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
          intervals[id] = window.setInterval(function() {
            var sec = parseInt($('.sec', modal).text()) - 1;
            if(sec >= 0) {
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
          var expires = settings.cookieExpires; // set the default time until a cookie expires
          
          // Check if modal has specified cookie expire limit
          if (modal.data('expires')) {
            expires = modal.data('expires');
          }
          
          // Set the cookie.
          $.cookie('smartModal-'+id, 'shown', { 'path' : '/', 'expires' : expires });
        }
        
        // Unbind the modal trigger if one is on the page
        if ($('.' + id).length) {
          $('.' + id).unbind('click');
        }
      }
    },
    // Close a modal
    'closeModal': function(id) {
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
          
          modal.fadeOut(settings.hideDelay, function() {
            // Make sure no other modals are active before removing the overlay
            if(!$('.smartmodal-modal:visible').length) {
              methods.removeOverlay();
            }
          });
        }
      }
    },
    // Remove the modal overlay
    'removeOverlay': function() {
      if($('#smartmodal-overlay').length) {
        $('#smartmodal-overlay').fadeOut(settings.hideDelay, function() {
          $(this).remove();
        });
      }
    },
    // Position the modal
    'positionModal': function(id) {
      if(id) {
        // Check to make sure the modal exists
        if ($('#' + id).length) {
          // Get the window's dimisions
          var width = $(window).width(),
              height = $(window).height();
            
          // Get the modal
          var modal = $('#' + id);
          
          // Get the modal's dimisions
          var mwidth = modal.width(),
              mheight = modal.height();
          
          // Adjust the modal's position
          modal.css({
            'top': (height - mheight) / 2,
            'left': (width - mwidth) / 2
          });
        }
      } else {
        $.each($('.smartmodal-modal'), function() {
          // Get the window's dimisions
          var width = $(window).width(),
              height = $(window).height();
          
          // Get the modal's dimisions
          var mwidth = $(this).width(),
              mheight = $(this).height();
          
          // Adjust the modal's position
          $(this).css({
            'top': (height - mheight) / 2,
            'left': (width - mwidth) / 2
          });
        });
      }
    }
  }
  
  // Counts the number of modals on the page
  function countModals() {
    numModals = $('.smartmodal').length;
    if (settings.debug) {
      console.log('smartModal Notice: ' + numModals + ' smartModals found on the page.');
    }
  }
  
  function eventHandler() {
    // Check if shortkeys are enabled
    if (settings.shortkeys) {
      // Listen for ESC key.
      $(document).keyup(function(e) {
        if (e.keyCode == 27) { // esc
          $.each($('.smartmodal-modal'), function() {
            if (!$(this).hasClass('sticky')) {
              var id = $(this).attr('id');
              
              methods.closeModal(id);
            }
          });
        }
      });
    }
    
    // Listen when the close trigger is clicked
    $('.smartmodal .close').bind("click", function(e) {
      var id = $(this).parent('.smartmodal').attr('id');
      methods.closeModal(id);
    });
    
    // Listen for window resize
    $(window).resize(function(e) {
      methods.positionModal();
    });
    
    // Check if clicking on the overlay to close is enabled
    if (settings.clickClose) {
      $('body').delegate("#smartmodal-overlay", "click", function(e) {
        e.preventDefault();
        $.each($('.smartmodal-modal'), function() {
          methods.closeModal($(this).attr('id'));
        });
      });
    }
  }
  
  // Setup the modals
  function setupModals() {
    // Find and initialize all modals
    $('.smartmodal').each(function() {
      var modal = $(this); // Get the modal
      
      // Check to ensure each modal has an ID, if not, assign one
      if (!modal.attr('id')) {
        var c = true;
        while (c) {
          var i = 'smartModal-' + Math.floor((Math.random() * numModals) + 1);
          if (!$('#' + i).length) {
            modal.attr('id', i);
            c = false;
          }
        }
      }
      
      var id = modal.attr('id'); // Get the modal id
      
      // Check if duplicate IDs exist
      if ($.inArray(id, modalIDs) > -1) {
        if (settings.debug) {
          console.log('smartModal Error: Multiple #' + id + ' IDs');
        }
      }
      modalIDs.push(id);
      
      // Check if modal should appear automagically
      if (modal.hasClass('once')) {
        // First, check web storage
        if (storageEnabled) {
          if (localStorage['smartModal-' + id] === 'shown') {
            // The modal has already been shown, so remove from the page
            modal.remove();
            modal = false;
            countModals();
          }
        // If web storage isn't supported, check cookies
        } else if (cookiesEnabled) {
          if ($.cookie('smartModal-'+id) === 'shown') {
            // The modal has already been shown, so remove from the page
            modal.remove();
            modal = false;
            countModals();
          }
        }
      }
      
      // Initialize the modal
      if (modal) {
        // Hide the modal from the page
        modal.hide();
        
        // Check if the modal should popup automagically
        if (modal.hasClass('auto')) {
          // Check if a timer has been set to show the modal
          if (modal.data('wait')) {
            // Set the timeout
            setTimeout(function() {
              methods.showModal(id);
            }, (modal.data('wait') * 1000));
          } else {
            // Show the modal as soon as the page has loaded
            methods.showModal(id);
          }
        }
        
        // Check if a modal trigger is on the page
        if ($('.' + id).length) {
          // Bind the modal trigger to the click event
          $('.' + id).bind('click', function(e) {
            e.preventDefault();
            methods.showModal(id);
          })
        }
      }
    });
  }
  
  $.smartModal = function(options, id) {
    if (typeof options == 'object') {
      settings = $.extend(settings, options);
      methods.init();
    } else if (typeof options == 'string' && typeof id == 'string') {
      switch (options) {
        case 'show':
          methods.showModal(id);
        break;
        case 'hide':
          methods.closeModal(id);
        break;
        default:
          if (settings.debug) {
            console.log('smartModal Error: ' + options + 'is not an available method.');
          }
        break;
      }
    } else if (typeof options == 'string' && typeof id == 'object') {
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
            console.log('smartModal Error: ' + options + 'is not an available method.');
          }
        break;
      }
    } else {
      if (settings.debug) {
        console.log('smartModal Error: Couldn\'t initialize.');
      }
    }
  }
}(jQuery));
