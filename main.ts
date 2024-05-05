/*
 * @Date: 2024-05-03 21:23:57
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-05 23:35:17
 * @FilePath: \min-vue\main.ts
 * @Description:ts入口文件
 * @Author: hehaipeng
 */
import { reactive } from "./reactivity/reactive";
import { effect } from "./reactivity/effect";
import { computed } from "./reactivity/computed";
import { watch } from "./reactivity/watch";
import { ref } from "./reactivity/ref";

const app = document.getElementById("app");
// reactive只接收引用数据类型
const obj = ref("1");
// effect(() => {
//   app.innerHTML = obj.name;
// });
watch(
  obj,
  (newValue, oldValue) => {
    console.log(newValue, oldValue);
  }
);
setTimeout(() => {
  obj.value = "hhp2";
}, 1000);
