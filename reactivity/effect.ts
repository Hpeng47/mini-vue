/*
 * @Date: 2024-05-03 21:23:28
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-05 23:32:17
 * @FilePath: \min-vue\reactivity\effect.ts
 * @Description:副作用函数，把数据和dom进行绑定
 * @Author: hehaipeng
 */

let activeEffect: any;
interface IEffectOptions {
  lazy?: boolean; // 是否延迟执行
  scheduler?: (fn: () => any) => any; // 配合trigger调用，目前作用是更新计算属性是否继续走缓存
}
export const effect = (fn: () => any, effectOptions?: IEffectOptions) => {
  console.log("effect", fn);

  const __effect = () => {
    activeEffect = __effect;
    return fn();
  };
  __effect.options = effectOptions;
  if (effectOptions && effectOptions.lazy) {
    return __effect;
  } else {
    __effect();
    return __effect;
  }
};

// 容器存放依赖 对象做为key value是依赖集合，
export const targetMap = new WeakMap();

// 收集依赖
export const track = (target: object, key: string | symbol) => {
  // 获取当前对象的依赖集合
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    // 如果没有就创建
    depsMap = new Map();
    targetMap.set(target, depsMap); // 设置初始值key为对象，value为依赖集合
  }
  let deps = depsMap.get(key); // 获取当前属性的依赖集合
  if (!deps) {
    // 如果没有就创建
    deps = new Set();
    depsMap.set(key, deps); // 设置初始值key为属性，value为一个set集合为了避免添加重复的依赖副作用函数
  }
  deps.add(activeEffect); // 添加副作用函数
};

// 更新依赖
export const trigger = (target: object, key: string | symbol) => {
  const depsMap = targetMap.get(target); // 获取当前对象的依赖集合
  console.log(depsMap);
  
  if (depsMap) {
    const deps = depsMap.get(key); // 获取当前属性的依赖集合
    console.log(deps);

    deps &&
      deps.forEach((effect: any) => {
        if (effect?.options?.scheduler) {
          effect.options.scheduler(effect); // 更新依赖的调度器，而非直接更新依赖
        } else {
          effect && effect(); // 将依赖集合中的所有依赖函数都执行
        }
      });
  }
};
