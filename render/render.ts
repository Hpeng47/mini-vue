/*
 * @Date: 2024-05-06 21:49:34
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-16 23:12:12
 * @FilePath: \min-vue\render\render.ts
 * @Description: render函数
 * @Author: hehaipeng
 */
interface Component {
  render(): Vnode;
  data(): object;
  setup(): object;
  beforeCreate(): void;
  created(): void;
  beforeMount(): void;
  mounted(): void;
  beforeUpdate(): void;
  updated(): void;
  beforeDestroy(): void;
  destroyed(): void;
}

export class Vnode {
  tag: string | Component; // 标签名称 | 组件
  el?: HTMLElement; // 挂载的节点,真实dom
  key?: string | number;
  children?: Vnode[] | string; // 子节点;
}

function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

/**
 * @Description: 创建渲染函数（只实现了必须有根节点的虚拟dom渲染）
 * @Author: hehaipeng
 */
const createRender = () => {
  /**
   * @Description: 卸载当前虚拟节点
   * @Author: hehaipeng
   * @param {Vnode} vnode
   */
  const unmount = (vnode: Vnode) => {
    const parent = vnode.el.parentNode; //找到虚拟节点对应的真实父节点
    if (parent) {
      parent.removeChild(vnode.el); // 真实父节点移除虚拟节点对应的真实节点，实现卸载
    }
  };

  /**
   * @Description: 父节点插入元素
   * @Author: hehaipeng
   * @param {HTMLElement} el 节点
   * @param {HTMLElement} parent 父节点
   * @param {*} anchor // 插入元素位置 默认为null
   */
  const insertBefore = (
    el: HTMLElement, // 节点
    parent: HTMLElement, // 父节点
    anchor = null
  ) => {
    parent.insertBefore(el, anchor);
  };

  /**
   * @Description: 插入文本至dom中
   * @Author: hehaipeng
   * @param {HTMLElement} node
   * @param {*} text
   */
  const setElementText = (node: HTMLElement, text) => {
    node.textContent = text;
  };

  /**
   * @Description: 创建元素
   * @Author: hehaipeng
   * @param {any} tag 标签类型
   * @param {object} props 属性
   */
  const createElement = (tag, props?: object) => {
    return document.createElement(tag);
  };

  /**
   * @Description: 挂载核心功能
   * @Author: hehaipeng
   * @param {Vnode} vnode 虚拟dom
   * @param {HTMLElement} container 挂载点
   */
  const mountElement = (vnode: Vnode, container, anchor) => {
    const root = createElement(vnode.tag); // 创建虚拟dom根节点的真实dom
    vnode.el = root; // 挂载的时候把当前的真实dom挂载到对应的vnode上

    if (typeof vnode.children === "string") {
      setElementText(root, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((v) => {
        patch(null, v, root); // 递归调用自己传入自己的子节点，创建并挂载到当前节点
      });
    }
    // 把所有的虚拟dom都挂载到容器上
    insertBefore(root, container, anchor);
  };

  /**
   * @Description: 更新元素
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   */
  const patchElement = (oldNode, newNode) => {
    console.log(oldNode, newNode);

    const el = (newNode.el = oldNode.el); // 虚拟dom根节点对应的真实dom

    patchKeyChildren(oldNode, newNode, el);

    // patchChildren(oldNode, newNode, el);
  };

  /**
   * @Description: 更新虚拟dom子节点，无key的更新方法
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   * @param {Element} container 挂载点
   */
  const patchChildren = (oldNode, newNode, container) => {
    newNode.el = oldNode.el;
    if (oldNode.children === newNode.children) {
      return;
    }
    if (typeof newNode.children === "string") {
      setElementText(container, newNode.children);
    } else if (Array.isArray(newNode.children)) {
      if (Array.isArray(oldNode.children)) {
        // 移除所有旧节点
        oldNode.children.forEach((c) => unmount(c));
        // 挂载子节点
        newNode.children.forEach((c) => patch(null, c, container));
      } else {
        setElementText(oldNode.el, "");
        // 挂载子节点
        newNode.children.forEach((c) => patch(null, c, container));
      }
      2;
    }
  };

  /**
   * @Description: 更新虚拟dom子节点，有key的更新方法
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   * @param {Element} container 挂载点
   */
  const patchKeyChildren = (oldNode, newNode, container) => {
    console.log(oldNode, newNode, container);
    let j = 0;
    const oldChildren = oldNode.children as Vnode[];
    const newChildren = newNode.children as Vnode[];
    let e1 = oldChildren.length - 1; // 旧节点索引
    let e2 = newChildren.length - 1; // 新节点索引
    // 前序对比
    while (j <= e1 && j <= e2) {
      const oldVNode = oldChildren[j];
      const newVNode = newChildren[j];
      if (oldVNode.key === newVNode.key) {
        patch(oldVNode, newVNode, container);
      } else {
        break;
      }
      j++;
    }
    // 后序对比
    while (j <= e1 && j <= e2) {
      const oldVNode = oldChildren[e1];
      const newVNode = newChildren[e2];
      if (oldVNode.key === newVNode.key) {
        patch(oldVNode, newVNode, container);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 新增 只有一下情况会走这个分支
    // old 1 2 3 4
    // new 1 2 3 4 5
    if (j > e1) {
      if (j <= e2)
        while (j <= e2) {
          const newVNode = newChildren[j];
          patch(null, newVNode, container);
          j++;
        }
    }
    // 删除 只有一下情况会走这个分支
    // old 1 2 3 4 5 6 7 8
    // new 1 2 3 10 11
    else if (j > e2) {
      console.log("删除");

      if (j <= e1)
        while (j <= e1) {
          const oldVNode = oldChildren[j];
          unmount(oldVNode);
          j++;
        }
    } else {
      // 现在处理乱序，既有删除也有新增也有插入
      const s1 = j; // 记录前序对比和后续对比后j的值
      const s2 = j; // 记录前序对比和后续对比后j的值

      // 旧 1，2，3，4，5，6
      // 新 1，3，4，2，7，6
      // keyToNewIndexMap[ 3=>1 , 4=>2 , 2=>3 , 7=>4, 6=>5 ]
      const keyToNewIndexMap = new Map(); // 这个map记录的是新节点的key和索引对应map中key是新节点的key，value是索引
      for (j = s2; j <= e2; j++) {
        const newChildrenId = newChildren[j]; // 新节点
        keyToNewIndexMap.set(newChildrenId.key, j); // 新节点key和新节点对应的索引
      }

      let patched = 0; // 匹配的节点数量
      let pos = 0; // 移动下标
      let moved = false; // 是否移动
      const toBePatched = e2 - s2 + 1; // 过滤掉新增和删除的节点后的节点数量
      // 旧 1，2，3，4，5，6
      // 新 1，3，4，2，7，6
      // newIndexToOldIndexMap[2，3，1 ，-1，-1]
      const newIndexToOldIndexMap = new Array(toBePatched).fill(-1); // 可以得到剔除掉前序对比和后续对比后中间乱序的节点集合,这个集合记录的是新节点的索引和旧节点的索引对应
      for (let i = s1; i <= e1; i++) {
        // 循环剩下的旧节点
        const oldChild = oldChildren[i]; // 旧节点
        const key = keyToNewIndexMap.get(oldChild.key); // 拿到和旧节点相同key的新节点索引，这样就可以知道哪些新节点可以被复用
        if (key !== undefined) {
          // 可以被复用的新节点因为他们有对应的旧节点
          const newVNode = newChildren[key]; // 新节点
          patch(oldChild, newVNode, container); // 旧节点和新节点对比，并更新（把真实dom挂载到新节点上），此时顺序并不是新节点的顺序，但是真实dom都已经准确的挂上了
          patched++;
          // 新节点的索引减去移动下标的索引，得到剩下的新节点索引和旧节点原来的索引的映射
          newIndexToOldIndexMap[key - s2] = i; // 下标是剩下的新节点索引，值是旧节点的索引
          if (key < pos) {
            // 新节点的索引小于移动下标索引，说明有节点需要移动
            moved = true;
          } else {
            pos = key;
          }
        } else {
          unmount(oldChild);
        }
      }
      if (moved) {
        const seq = getSequence(newIndexToOldIndexMap);
        console.log(seq);

        let s = (seq.length = 1);
        let i = toBePatched - 1; // 新节点剩下的长度
        for (i; i >= 0; i--) {
          if (newIndexToOldIndexMap[i] === -1) {
            const pos = i + s2; // 起点 + 新节点剩下的长度等于剩下的新节点最后一个节点的索引
            const newVNode = newChildren[pos];
            let anchor; // 锚点，
            if (pos + 1 < newChildren.length) {
              anchor = newChildren[pos + 1].el;
            } else {
              anchor = null;
            }
            patch(null, newVNode, container, anchor);
          } else if (i !== seq[s]) {
            const pos = i + s2;
            const newVnode = newChildren[pos];
            let anchor = null;
            if (pos + 1 < newChildren.length) {
              anchor = newChildren[pos + 1].el;
            }
            console.log(newVnode, container, anchor);
            insertBefore(newVnode.el, container, anchor);
          } else {
            s--;
          }
        }
      }
      console.log(newIndexToOldIndexMap);
    }
  };
  /**
   * @Description:虚拟dom插入更新
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   * @param {Element} parent 挂载点
   */
  const patch = (oldNode, newNode, container, anchor = null) => {
    if (!oldNode) {
      // 没有旧节点，直接挂载
      mountElement(newNode, container, anchor);
    } else {
      // 有旧节点就走更新逻辑
      if (typeof newNode.children === "string") {
        patchChildren(oldNode, newNode, oldNode.el);
      } else {
        patchElement(oldNode, newNode);
      }
    }
  };

  /**
   * @Description: 渲染
   * @Author: hehaipeng
   * @param {Vnode} vnode 虚拟dom
   * @param {HTMLElement} container 挂载点
   */
  const render = (vnode: Vnode, container) => {
    console.log(vnode, container);
    if (vnode) {
      // 更新逻辑，拿到当前挂载点的虚拟dom和新的虚拟dom以及挂载点
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        unmount(container._vnode);
      }
    }
    container._vnode = vnode; //挂载旧的虚拟dom更新为新的虚拟dom
  };
  return {
    render,
  };
};

export const createApp = (vnode) => {
  const renderer = createRender();
  return {
    mount(container) {
      renderer.render(vnode, container);
    },
  };
};
