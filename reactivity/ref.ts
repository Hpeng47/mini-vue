import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export const ref = <T>(value: T) => {
  return new RefImpl<T>(value);
};

const isObject = (value: any) => {
  return value !== null && typeof value === "object";
};

const toReactive = (value) => {
  return isObject(value) ? reactive(value) : value;
};

class RefImpl<T> {
  private _value: T;
  constructor(value: T) {
    this._value = toReactive(value);
  }
  get value() {
    track(this, "value");
    return this._value;
  }
  set value(newValue) {
    if (newValue === this._value) return;
    this._value = toReactive(newValue);
    console.log("触发");
    console.log(trigger);

    trigger(this, "value");
  }
}
