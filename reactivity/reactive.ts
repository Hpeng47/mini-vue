/*
 * @Date: 2024-05-03 21:23:37
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-05 22:26:13
 * @FilePath: \min-vue\reactivity\reactive.ts
 * @Description: vue响应式reactive源码
 * @Author: hehaipeng
 */

import { track, trigger } from "./effect";

// 响应式
export const reactive = <T extends object>(value: T) => {
  return new Proxy(value, {
    get: (target, key, receiver) => {
      console.log("get");
      let res = Reflect.get(target, key, receiver);
      track(target, key); //收集依赖
      return res;
    },
    set: (target, key, value, receiver) => {
      console.log("set");
      let res = Reflect.set(target, key, value, receiver);
      trigger(target, key); //触发依赖
      return res;
    },
  });
};
