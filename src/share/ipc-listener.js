import e from "electron";
import s from "./platform";
let i = null;
i = s.isMainProcess ? e.ipcMain : e.ipcRenderer;

export default class {
  constructor() {
    this.listeningIpcs = [];
  }
  on(e, s) {
    i.on(e, s);
    this.listeningIpcs.push([e, s]);
  }
  once(e, s) {
    i.once(e, s);
    this.listeningIpcs.push([e, s]);
  }
  clear() {
    for (let s of this.listeningIpcs) {
      i.removeListener(s[0], s[1]);
    }

    this.listeningIpcs.length = 0;
  }
}
