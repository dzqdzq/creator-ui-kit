import s from "events";
import e from "./platform";
let t;
let r;

class n {
  constructor() {
    this._commands = [];
    this.desc = "";
  }
  undo() {
    for (let i = this._commands.length - 1; i >= 0; --i) {
      this._commands[i].undo();
    }
  }
  redo() {
    for (let i = 0; i < this._commands.length; ++i) {
      this._commands[i].redo();
    }
  }
  dirty() {
    for (let i = 0; i < this._commands.length; ++i) {
      if (this._commands[i].dirty()) {
        return true;
      }
    }
    return false;
  }
  add(i) {
    this._commands.push(i);
  }
  clear() {
    this._commands = [];
  }
  canCommit() {
    return this._commands.length;
  }
}
class d extends s {
  constructor(i) {
    super();
    this._silent = false;
    this._type = i;
    this._curGroup = new n();
    this._groups = [];
    this._position = -1;
    this._savePosition = -1;
    this._id2cmdDef = {};
  }
  register(i, s) {
    this._id2cmdDef[i] = s;
  }
  reset() {
    this.clear();
    this._id2cmdDef = {};
  }
  undo() {
    if (this._curGroup.canCommit()) {
      this._curGroup.undo();
      this._changed("undo-cache");
      this._curGroup.clear();
      return undefined;
    }
    if (this._position < 0) {
      return;
    }
    this._groups[this._position].undo();
    this._position--;
    this._changed("undo");
  }
  redo() {
    if (this._position >= this._groups.length - 1) {
      return;
    }
    this._position++;
    this._groups[this._position].redo();
    this._changed("redo");
  }
  add(i, s) {
    let e = this._id2cmdDef[i];
    if (!e) {
      console.error(`Cannot find undo command ${i}, please register it first`);
      return undefined;
    }
    this._clearRedo();
    let o = new e(s);
    this._curGroup.add(o);
    this._changed("add-command");
  }
  commit() {
    if (this._curGroup.canCommit()) {
      this._groups.push(this._curGroup);
      this._position++;
      this._changed("commit");
    }

    this._curGroup = new n();
  }
  cancel() {
    this._curGroup.clear();
  }
  collapseTo(i) {
    if (i > this._position || i < 0) {
      console.warn(`Cannot collapse undos to ${i}`);
      return undefined;
    }
    if (i === this._position) {
      return;
    }
    let s = this._groups[i];
    for (let e = i + 1; e < this._groups.length; ++e) {
      this._groups[e]._commands.forEach((i) => {
        s.add(i);
      });
    }
    this._groups = this._groups.slice(0, i + 1);
    this._position = i;

    if (this._savePosition > this._position) {
      this._savePosition = this._position;
    }

    this._changed("collapse");
  }
  save() {
    this._savePosition = this._position;
    this._changed("save");
  }
  clear() {
    this._curGroup = new n();
    this._groups = [];
    this._position = -1;
    this._savePosition = -1;
    this._changed("clear");
  }
  dirty() {
    if (this._savePosition !== this._position) {
      let i = Math.min(this._position, this._savePosition);
      let s = Math.max(this._position, this._savePosition);
      for (let e = i + 1; e <= s; e++) {
        if (this._groups[e].dirty()) {
          return true;
        }
      }
    }
    return false;
  }
  setCurrentDescription(i) {
    this._curGroup.desc = i;
  }
  _clearRedo() {
    if (this._position + 1 !== this._groups.length) {
      this._groups = this._groups.slice(0, this._position + 1);
      this._curGroup.clear();

      this._savePosition > this._position &&
        (this._savePosition = this._position);

      this._changed("clear-redo");
    }
  }
  _changed(i) {
    if (!this._silent) {
      return this._type === "local"
        ? (this.emit("changed", i), undefined)
        : undefined;
    }
  }
}

if (e.isMainProcess) {
  r = new d("global");
}

let c = {
  undo() {
    r.undo();
  },
  redo() {
    r.redo();
  },
  add(i, s) {
    r.add(i, s);
  },
  commit() {
    r.commit();
  },
  cancel() {
    r.cancel();
  },
  collapseTo(i) {
    r.collapseTo(i);
  },
  save() {
    r.save();
  },
  clear() {
    r.clear();
  },
  reset: () => r.reset(),
  dirty: () => r.dirty(),
  setCurrentDescription: (i) => r.setCurrentDescription(i),
  register(i, s) {
    r.register(i, s);
  },
  local: () => new d("local"),
  Command: class {
    constructor(i) {
      this.info = i;
    }
    undo() {
      console.warn('Please implement the "undo" function in your command');
    }
    redo() {
      console.warn('Please implement the "redo" function in your command');
    }
    dirty() {
      return true;
    }
  },
  _global: r,
};
export default c;

// IPC functionality removed
