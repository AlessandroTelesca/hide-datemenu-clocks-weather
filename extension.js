import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class HideDateMenuClocksWeather extends Extension {
    enable() {
        const dm = Main.panel.statusArea.dateMenu;
        this._items = [dm._clocksItem, dm._weatherItem].filter(Boolean);
        this._ids = this._items.map(item => {
            item.hide();
            return item.connect('notify::visible', () => {
                if (item.visible)
                    item.hide();
            });
        });
    }

    disable() {
        this._items?.forEach((item, i) => {
            item.disconnect(this._ids[i]);
            item._sync?.();
        });
        this._items = null;
        this._ids = null;
    }
}
