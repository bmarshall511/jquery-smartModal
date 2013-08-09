jQuery.smartModal
=================

A simple, lightweight jQuery modal plugin that's highly configurable, easy-to-use &amp; implement. Includes multiple implementation options like timed, automatic, sticky modals and more! It has the ability to show modals only once per user using HTML5 web storage or [jQuery.cookie](https://github.com/carhartl/jquery-cookie) as a fallback.

## Installation

Include the `jquery.smartModal.js` script *after* the jQuery library (unless you are packaging scripts somehow else) then initialize the plugin:

```html
<script src='jquery.smartModal.js'></script>
<!-- Optional, fallback for older browsers that don't support webStorage. -->
<script src='jquery.cookie.js'></script>
<script>
$(function() {
  $.smartModal();
});
</script>
```

**Do not include the script directly from GitHub**. The file is being served as text/plain and as such being blocked in Internet Explorer on Windows 7 for instance (because of the wrong MIME type). Bottom line: GitHub is not a CDN.

Add the CSS from the `jquery.smartModal.css` to your exisiting CSS or link to it directly:

```html
<link rel='stylesheet' href='jquery.smartModal.css'>
```

*Feel free to edit the CSS to suit your site's needs.*

## Usage

To get started, create your modal box by adding the class, `smartmodal` to it. You can define a *trigger class* by specifying the `id` attribute:

```html
<div class="smartmodal" id="triggerID">I'm a normal modal!</div>
<a href="#" class="triggerID">Click me</a> to trigger a normal modal.
```

Now when a user clicks on an element with the `triggerID` class, the modal will popup.

## Examples

A basic modal with a trigger:

```html
<div class="smartmodal" id="triggerID">I'm a normal modal!</div>
<a href="#" class="triggerID">Click me</a>
```

A modal that only get's shown once:

```html
<div class="smartmodal once" id="triggerID" data-expires="7">I'll only get shown once!</div>
<a href="#" class="triggerID">Click me</a>
```

A modal that disappears after so many seconds:

```html
<div class="smartmodal" id="triggerID" data-time="5">I'm a timed modal!</div>
<a href="#" class="triggerID">Click me</a>
```

A modal that disappears after so many seconds and shows the number of remaining seconds left:

```html
<div class="smartmodal" id="triggerID" data-time="10">I'm a timed modal, <span class="sec"></span> seconds before I close!</div>
<a href="#" class="triggerID">Click me</a>
```

A modal that automatically pops up after the page loads:

```html
<div class="smartmodal auto">I'm automatic after page load!</div>
```

A modal that automatically pops up after a specified number of seconds:

```html
<div class="smartmodal auto" data-wait="10">I'm automatic after 10 seconds!</div>
```

A modal that can't be closed (sticky):

```html
<div class="smartmodal sticky auto">I can't be closed!</div>
```

A sticky modal that's closed after a specified number of seconds:

```html
<div class="smartmodal sticky auto" data-time="9">You can't close me, but I'll close myself after <span class="sec"></span> seconds!</div>
```

A sticky modal that can be manually closed after a specified number of seconds:

```html
<div class="smartmodal sticky auto" data-time="9" data-close="manual">I can't be closed until <span class="sec"></span> seconds! <a href="#" class="close">Close Me</a></div>
```

An automated timed sticky modal that can be manually closed after a specified number of seconds:

```html
<div class="smartmodal sticky auto" data-wait="10"  data-time="9" data-close="manual">I can't be closed until <span class="sec"></span> seconds! <a href="#" class="close">Close Me</a></div>
```

An animated modal:

```html
<div class="smartmodal sticky auto" data-animation="top|easeOutBounce|5000">I'm animated with the easeOutBounce effect that lastes 5 seconds.</div>
```

## Configuration Options

*smartModal* allows for additional configuration options to allow for more flexibility and control over the modals.

### Initialization Options

You can set some default options for your modals with initializating the plugin like so:

```javascript
$.smartModal({
  overlayDelay: 300,
  hideDelay: 300,
  cookieExpires: 7
});
```

#### Available Initialization Options

| Option | Description |
| --- | --- |
| `overlayDelay` | *Integer.* Number of milliseconds it takes for the modal to fade in. |
| `hideDelay` | *Integer.* Number of milliseconds it takes for the modal to fade out. |
| `cookieExpires` | *Integer.* Number of days until the modal cookies expire. |
| `debug` | *Boolean.* Enable/disbale debug mode. |
| `shortkeys` | *Boolean.* Enable/disable shortcut keys. |
| `clickClose` | *Boolean.* Enable/disbale the ability to close the modals by clicking on the overlay. |
| `animationDuration` | *Integer.* Default number of milliseconds for the animation duration. |
| `animationEasing` | *String.* The default easing effect for the modal animation. See http://easings.net/ |
| `gaTracking` | *Boolean.* Enable/disable Google Analytics event tracking. |


### Modal Class Attribute Options

| Class | Description |
| --- | --- |
| `once` | Will only show the modal once per page load. [jquery.cookie](https://github.com/carhartl/jquery-cookie) will need to be loaded to enable modals to be shown once per visit. |
| `auto` | Enables the modal to popup automatically when the page is loaded. You can specify the `data-wait` attribute to set the number of seconds before the modal pops up. |
| `sticky` | Disables the ability to close the modal. |

### Modal Attribute Options

| Attribute | Description |
| --- | --- |
| `data-expires` | *Integer.* Specify the number of days until the cookie expires. |
| `data-time` | *Integer.* Specify the number of seconds the modal should be visible. |
| `data-wait` | *Integer* Specify the number of seconds before the modal should popup. Should be used with the `auto` class. |
| `data-close` | *String (manual).* Disables the modal from closing automatically. Used in conjunction with `data-time` and the `sticky` class. |
| `data-animation` | *String (start effect duration).* Specifies the modals animation settings. |
| `data-name` | *String.* The name of the modal. Used for GA event tracking. |

### Additional Modal Options

#### Show number of seconds remaining

You can display the number of remaining seconds until the modal disappears within the modal by applying the `sec` class to an element:

```html
<div class="smartmodal" data-time="10">I'm a timed modal <span class="sec"></span> seconds before I close!</div>
```

#### Add a close trigger in the modal

You can easily add a close trigger to allow the modal to close when a user clicks on it:

```html
<div class="smartmodal">I'm a normal modal! <a href="#" class="close">Close Me</a></div>
```

## API Methods

To make it easy to call jQuery.smartModal's methods, you can use it's API:

```javascript
$.smartModal('show', 'modalID'); // Shows a modal
$.smartModal('hide', 'modalID'); // Hides a modal
$.smartModal('settings', settingsObj); // Define smartModal's default settings
$.smartModal('init', settingsObj); // Initialize the smartModal plugin
```

## Cross-Browser Compatibility

This plugin has been tested in the following browsers:

* Google Chome
 * Version 28
 * Version 27
* Firefox
 * Version 21
* Safari
 * Version 6
* Opera
 * Version 12


## Development

* Source hosted at [GitHub](https://github.com/bmarshall511/jquery-smartModal)
* Report issues, questions, feature requests on [GitHub Issues](https://github.com/bmarshall511/jquery-smartModal/issues)

### Changelog

#### Version 2.0.0

* Fixed issue the modal woudn't initialize the settings object is defined
* Changed the GA event tracking naming convention structure
* Fixed JS error when the GA tracking script hasn't be loaded
* Fixed the missing `shortkey` setting

#### Version 1.1.2

* Fixed issue where the modal wouldn't initialize when no settings are defined
* Fixed problem when trying to detect if Google Analytics tracking script has been loaded
* Integrated Google Event Tracking (https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)

#### Version 1.1.1

* Fixed issue with close trigger
* Added the ability for modal animations
* Added minified version of the script
* Cleaned-up JS with JSlint.com
* Started on integrating Google Analytics event tracking

#### Version 1.1.0

* Added API methods
* Fixed issue with timeouts and intervals
* Added the ability to create sticky timed modals
* Added the ability for a *close* trigger in the modal
* Added debugging check for smartModals with duplicate id attributes

## Authors

[Ben Marshall](http://www.benmarshall.me)