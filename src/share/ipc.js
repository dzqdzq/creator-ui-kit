import { wrapError } from "./utils";
let e = {};

e._checkReplyArgs = (e) => {
  if (e.length === 0) {
    return true;
  }
  let [t] = e;
  return (
    t === null ||
    t === undefined ||
    (t instanceof Error
      ? ((t = wrapError(t)), (e[0] = t), true)
      : !!("__error__" in t))
  );
};

e._popOptions = (e) => {
  let r = e[e.length - 1];
  return r && typeof r == "object" && r.__ipc__ ? (e.pop(), r) : null;
};

e._popReplyAndTimeout = (e, r) => {
  let t;
  let n;
  let o = e[e.length - 1];
  if (typeof o == "number") {
    if (e.length < 2) {
      return null;
    }
    n = o;

    if ("function" != typeof (o = e[e.length - 2])) {
      return null;
    }

    t = o;
    e.splice(-2, 2);
  } else {
    if (typeof o != "function") {
      return null;
    }
    t = o;
    n = r ? 10000 /* 1e4 */ : 180000 /* 18e4 */;
    e.pop();
  }
  return { reply: t, timeout: n };
};

e.option = (e) => {
  e.__ipc__ = true;
  return e;
};

e._wrapError = (r) => {
  if (e._checkReplyArgs(r)) {
    return true;
  }
  let t = new Error(
    "Invalid argument for event.reply(), first argument must be null or Error"
  );

  r.unshift({
    __error__: true,
    stack: t.stack,
    message: t.message,
    code: "EINVALIDARGS",
  });

  return false;
};

e._unwrapError = (e) => {
  let [r] = e;
  return r && r.__error__ ? r : null;
};

e.ErrorTimeout = class extends Error {
  constructor(e, r, t) {
    super(`ipc timeout. message: ${e}, session: ${r}`);
    this.code = "ETIMEOUT";
    this.ipc = e;
    this.sessionId = r;
    this.timeout = t;
  }
};

e.ErrorNoPanel = class extends Error {
  constructor(e, r) {
    super(`ipc failed to send, panel not found. panel: ${e}, message: ${r}`);
    this.code = "ENOPANEL";
    this.ipc = r;
    this.panelID = e;
  }
};

e.ErrorNoMsg = class extends Error {
  constructor(e, r) {
    super(`ipc failed to send, message not found. panel: ${e}, message: ${r}`);

    this.code = "ENOMSG";
    this.ipc = r;
    this.panelID = e;
  }
};

e.ErrorInterrupt = class extends Error {
  constructor(e) {
    super(`Ipc will not have a callback. message: ${e}`);
    this.code = "EINTERRUPT";
    this.ipc = e;
  }
};

export default e;
