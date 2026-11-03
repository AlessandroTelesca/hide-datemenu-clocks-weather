# Hide Date Menu Clocks & Weather

Hides the *World Clocks* and *Weather* sections from the calendar/date menu. GNOME Shell shows those sections whenever GNOME Clocks and GNOME Weather are installed; this extension hides them without uninstalling the apps or touching their locations. Disabling it brings them back.

It hides the date menu's `_clocksItem` and `_weatherItem` and keeps them hidden when the Shell tries to show them again, so a GNOME Shell update that renames those can break it.

Install:

```sh
gnome-extensions pack --force . && gnome-extensions install --force hide-datemenu-clocks-weather@alessandrot.shell-extension.zip
```

then log out and in, and `gnome-extensions enable hide-datemenu-clocks-weather@alessandrot`.

GNOME Shell 50.
