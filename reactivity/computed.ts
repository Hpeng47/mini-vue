import { effect } from "./effect";
export const computed = (getter: () => any) => {
  let dirty = true;
  let value: any;
  const _value = effect(getter, {
    // 获得一个延迟执行的副作用函数，让计算属性调用。
    lazy: true,
    scheduler() {
      // 给计算属性添加一个调度器，当依赖改变的时候，执行调度器，修改dirty为true让计算属性重新计算
      dirty = true;
    },
  });
  // 创建一个计算属性类
  class ComputedRefImp {
    get value() {
      // 设置一个访问器计算属性的value
      if (dirty) {
        // 判断是否需要重新计算，是否走缓存
        value = _value();
        dirty = false;
      }
      return value;
    }
  }
  // 返回计算属性实例
  return new ComputedRefImp();
};
