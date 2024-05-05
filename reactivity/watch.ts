/*
 * @Date: 2024-05-03 21:23:51
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-05 23:26:09
 * @FilePath: \min-vue\reactivity\watch.ts
 * @Description:
 * @Author: hehaipeng
 */
import { effect } from "./effect";
interface IWatchOptions {
  immediate?: boolean;
  flush?: "pre" | "post" | "sync";
}

// 递归收集依赖
const traverse = (target, seen = new Set()) => {
  if (seen.has(target) || typeof target !== "object" || target === null) return;
  seen.add(target);
  for (const key in target) {
    console.log(key);
    
    if (Reflect.has(target, key)) {
      traverse(target[key], seen);
    }
  }
  return target;
};

// 监听
export const watch = (
  target: any,  // 监听的目标
  cb: (newValue, oldValue) => void, // 回调函数
  options?: IWatchOptions // 配置项
) => {
  let getter = () => target; // 默认监听对象，为了做参数格式化
  if (typeof target === "function") { // 如果传入的是函数，则直接作为监听函数
    getter = target;
  } else {
    getter = () => traverse(target); // 不是函数的话就将对象进行递归，做依赖收集
  }

  let oldValue, newValue; // 旧值和新值
  const job = () => {  // 调度函数，用于触发回调函数以及值的更新
    newValue = effectFn(); // 获取新值
    cb(newValue, oldValue); // 调用回调函数
    oldValue = newValue; // 更新旧值，交替更新
  };
  let effectFn = effect(getter, { lazy: true, scheduler: job }); // 创建一个副作用函数，用于获取新值
  if (options?.immediate) {
    job(); // 如果 immediate 为 true，则立即执行调度函数
  } else {
    oldValue = effectFn(); // 否则先执行一次副作用函数，获取旧值同时触发依赖收集
  }
};
