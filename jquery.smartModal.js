/**
 * jQuery smartModal
 * 
 * Version: 1.0.2
 * Author: Ben Marshall
 * Author URL: http://www.benmarshall.me
 * Plugin URL: http://www.benmarshall.me/jquery-smartmodal/
 * GitHub: https://github.com/bmarshall511/jquery-smartModal
 * 
 * Licensed under the MIT license
 */

;(function($) {
  $.smartModal = function(options) {
    var settings = $.extend({
      overlayDelay: 300,
      hideDelay: 300,
      cookieExpires: 365
    }, options);
    
    // Create the modal overlay.
    var overlay = $('<div />').addClass('smartmodal-overlay').attr('id', 'smartmodal-overlay');
    
    var methods = {
      'showModal': function(id) {
        var modal = $('#'+id);
        
        // Check if the overlay is active.
        if(!$('#smartmodal-overlay').length) {
          $('body').append(overlay);
          overlay.fadeIn(settings.overlayDelay);
        }
        
        // Position the modal.
        modal.addClass('smartmodal-modal').show();
        
        methods.positionModals();
        
        // Check if timed modal.
        if(modal.data('time')) {
          setTimeout(function() {
            methods.closeModal(id);
          }, (modal.data('time') * 1000));
          
          if($('.sec', modal).length) {
            $('.sec', modal).text(modal.data('time'));
            
            var interval = setInterval(function() {
              var sec = parseInt($('.sec', modal).text()) - 1;
              if(sec >= 0) {
                $('.sec', modal).text(sec);
              } else {
                window.clearInterval(interval);
              }
            }, 1000);
          }
        }
        
        // Check if only allowed to be shown once.
        if(modal.hasClass('once')) {
          
          // Check if jQuery Cookie is loaded.
          if($.cookie) {
            var expires = settings.cookieExpires;
            if(modal.data('expires')) {
              expires = modal.data('expires');
            }
            
            // Set the cookie.
            $.cookie('smartModal-'+id, 'shown', { 'path' : '/', 'expires' : expires });
          } else {
            console.log('jquery.smartModal.js Notice: jQuery Cookie plugin hasn\'t been loaded. Couldn\'t set the smartModal cookie.');
          }
          
          // Unbind the trigger and remove the modal.
          $('.'+id).unbind('click');
        }
      },
      'closeModal': function(id) {
        if($('#'+id).length) {
          $('#'+id).fadeOut(settings.hideDelay, function() {
            if(!$('.smartmodal-modal:visible').length) {
              methods.removeOverlay();
            }
          });
        }
      },
      'removeOverlay': function() {
        if($('#smartmodal-overlay').length) {
          $('#smartmodal-overlay').fadeOut(settings.hideDelay, function() {
            $(this).remove();
          });
        }
      },
      'positionModals': function() {
        var width = $(window).width(),
            height = $(window).height();
        $.each($('.smartmodal-modal'), function() {
          var mwidth = $(this).width(),
              mheight = $(this).height();
          $(this).css({
            'top': (height - mheight) / 2,
            'left': (width - mwidth) / 2
          });
        });
      }
    };
    
    
    // Listen for ESC key.
    $(document).keyup(function(e) {
      if (e.keyCode == 27) { // esc
        $.each($('.smartmodal-modal'), function() {
          if(!$(this).hasClass('sticky')) {
            var id = $(this).attr('id');
            methods.closeModal(id);
          }
        });
      }
    });
    
    // Listen for window resize.
    $(window).resize(function(e) {
      methods.positionModals();
    });
    
    return $('.smartmodal').each(function() {
      var ele = $(this);
      var id = ele.attr('id');
      
      var show = true;
      
      // If modal only allowed once, do a cookie check if available.
      if($.cookie) {
        if(ele.hasClass('once')) {
          if($.cookie('smartModal-'+id) == 'shown') {
            show = false;
          }
        }
      } else {
        console.log('jquery.smartModal.js Notice: jQuery Cookie plugin hasn\'t been loaded. Can\'t check cookies.');
      }
      
      if(show) {
        // Hide the modal from page by default.
        ele.hide();
        
        // Check if automatic modal.
        if(ele.hasClass('auto')) {
          if(ele.data('wait')) {
            setTimeout(function() {
              methods.showModal(id);
            }, (ele.data('wait') * 1000));
          } else {
            methods.showModal(id);
          }
        }
        
        // Bind modal trigger.
        $('.'+id).bind('click', function(e) {
          e.preventDefault();
          methods.showModal(id);
        });
      } else {
        ele.remove();
      }
    });
  }
}(jQuery));
