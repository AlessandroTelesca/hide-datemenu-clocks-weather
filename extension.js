// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: 2026 AlessandroTelesca

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Upstream connects signals with `this._sync.bind(this)` at construction time,
// so patching the prototype's _sync() alone does NOT affect sections that
// already exist (e.g. the main panel's): their bound closures keep calling the
// original _sync(), which re-shows the section whenever the weather client
// emits 'changed' (it updates every time the menu is opened).
//
// So we guard every instance directly via notify::visible, and patch _init()
// so instances created later (other panels / extensions) get the same guard.

export default class HideDateMenuClocksWeather extends Extension {
    enable() {
        const dm = Main.panel.statusArea.dateMenu;
        this._protos = [dm._clocksItem, dm._weatherItem]
            .filter(Boolean)
            .map(item => Object.getPrototypeOf(item));

        this._guarded = new Map(); // instance -> [notifyId, destroyId]

        const guard = item => this._guard(item);
        this._origInit = new Map();
        for (const proto of this._protos) {
            const orig = proto._init;
            this._origInit.set(proto, orig);
            proto._init = function (...args) {
                const ret = orig.apply(this, args);
                guard(this);
                return ret;
            };
        }

        this._forEachInstance(item => this._guard(item));
    }

    disable() {
        for (const [proto, orig] of this._origInit ?? [])
            proto._init = orig;

        for (const [item, [notifyId, destroyId]] of this._guarded ?? []) {
            item.disconnect(notifyId);
            item.disconnect(destroyId);
            item._sync?.();
        }

        this._guarded = null;
        this._origInit = null;
        this._protos = null;
    }

    _guard(item) {
        // A closure from a previous enable() cycle may still call us.
        if (!this._guarded || this._guarded.has(item))
            return;

        const notifyId = item.connect('notify::visible', () => {
            if (item.visible)
                item.hide();
        });
        const destroyId = item.connect('destroy', () => {
            this._guarded?.delete(item);
        });
        this._guarded.set(item, [notifyId, destroyId]);
        item.hide();
    }

    _forEachInstance(callback) {
        const walk = actor => {
            if (this._protos.includes(Object.getPrototypeOf(actor)))
                callback(actor);
            for (const child of actor.get_children())
                walk(child);
        };
        walk(global.stage);
        // Sections inside a closed menu may not be reachable from the stage.
        const dm = Main.panel.statusArea.dateMenu;
        [dm._clocksItem, dm._weatherItem].filter(Boolean).forEach(callback);
    }
}
