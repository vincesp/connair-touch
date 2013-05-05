# connair-touch

*An HTML touch UI for the ConnAir Home Automation Gateway*

Reuse your old iPods as control panels for your home. connair-touch displays touch-friendly on-off-switches for your ConnAir Home Automation Gateway. You can define several panel layouts and assign “devices” or “groups” to each panel. Then open the connair-touch page on your touch device, select one panel, and bookmark it as an app.

## Installation

Copy the contents of the `src` folder into a directory on the same web server where the ConnAir PHP site is running. You cannot use a different web server, since JSONP is not supported currently by ConnAir.

## Configuration

Edit the `config/panel-config.json` file.

**`connAirPath`:** Path to the connair PHP script. If you specify a relative path, it is relative to the `index.html` file, not to the configuration file.

**`colorScheme`:** Color Scheme for default colors, if you don’t specify your own colors. Allowed values: `"2357"` (default), `"2369"`, `"2375"`, and `"2379"`.

**`panels`:** Array of panel layouts.

### `panel` attributes

**`title`:** Title of the panel to be displayed on the panel selection screen. For languages that use terribly long words, `&shy;` is the only HTML entity that is allowed to support soft hyphens.

**`actors`:** Array of actors (on-off-switches).

### `actor` attributes

**`title`:** Title to display on the switch. Hint: keep it short, one row only.

**`color`:** Optional. Color for the switch. Use any HTML color.

**`type`:** Type value passed to the ConnAir PHP script. Examples: `"device"`, `"group"`, `"room"`. **Special type `"all"`:** If you set the type to `"all"` then this switch will send the `allon` or `alloff` command to the ConnAir PHP script. In this case, the `id` attribute is ignored.

**`id`:** ID to be sent to the ConnAir PHP script. See your ConnAir configuration.

## Security

connair-touch is capable of displaying a touch friendly “Enter PIN” screen, if you plan to expose your ConnAir UI to the Internet.

1. Secure your web server with HTTPS.
2. Configure your HTTP server to require basic authentication for the `config` folder and for the path where the ConnAir PHP script resides. The username has to be `connairpin`. The password has to be a PIN that contains 4 digits (0–9), since we don’t want to display an entire QWERTYU keyboard on the PIN screen. Configure your web server to respond with an 401 or 403 response code to request the PIN. 403 is preferred because 401 triggers the built-in authentication dialog of the browser first before allowing us to display our PIN screen.