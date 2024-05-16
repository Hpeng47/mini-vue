/*
 * @Date: 2024-05-03 21:23:57
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-16 22:37:27
 * @FilePath: \min-vue\main.ts
 * @Description:ts入口文件
 * @Author: hehaipeng
 */
import { reactive } from "./reactivity/reactive";
import { effect } from "./reactivity/effect";
import { computed } from "./reactivity/computed";
import { watch } from "./reactivity/watch";
import { ref } from "./reactivity/ref";
import { Vnode, createApp } from "./render/render";

const app = document.getElementById("app");

// reactive只接收引用数据类型
const obj = ref("1");
effect(() => {
  const vnode1: Vnode = {
    tag: "div",
    children: [
      { tag: "div", key: "1", children: "旧1" },
      { tag: "div", key: "2", children: "旧2" },
      { tag: "div", key: "3", children: "旧3" },
      { tag: "div", key: "4", children: "旧4" },
      { tag: "div", key: "5", children: "旧5" },
      { tag: "div", key: "6", children: "旧5" },
      { tag: "div", key: "7", children: "旧5" },
      { tag: "div", key: "8", children: "旧5" },
    ],
  };
  const vnode2: Vnode = {
    tag: "div",
    children: [
      { tag: "div", key: "1", children: "1" },
      { tag: "div", key: "2", children: "3" },
      { tag: "div", key: "3", children: "4" },
      { tag: "div", key: "10", children: "4" },
      { tag: "div", key: "9", children: "4" },
    ],
  };
  createApp(vnode1).mount(app);
  createApp(vnode2).mount(app);
});
// watch(
//   obj,
//   (newValue, oldValue) => {
//     console.log(newValue, oldValue);
//   }
// );
// setTimeout(() => {
//   obj.value = "hhp2";
// }, 1000);
