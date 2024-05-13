/*
 * @Date: 2024-05-06 21:49:34
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-13 23:36:12
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
  const mountElement = (vnode: Vnode, container) => {
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
    insertBefore(root, container);
  };

  /**
   * @Description: 更新元素
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   */
  const patchElement = (oldNode, newNode) => {
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
    console.log(oldNode, newNode, container);
    oldNode.el = newNode.el;
    if (oldNode.children === newNode.children) {
      console.log("一样的");

      return;
    }
    if (typeof newNode.children === "string") {
      setElementText(container, newNode.children);
    } else if (Array.isArray(newNode.children)) {
      if (Array.isArray(oldNode.children)) {
        console.log("都是数组");

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
    let e2 = newChildren.length - 1;
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
    }

    console.log(j);

    // 新增
    if (j > e1) {
      if (j <= e2)
        while (j <= e2) {
          const newVNode = newChildren[j];
          patch(null, newVNode, container);
          j++;
        }
    }
    // 删除
    else if (j > e2) {
      console.log("删除");

      if (j <= e1)
        while (j <= e1) {
          const oldVNode = oldChildren[j];
          unmount(oldVNode);
          j++;
        }
    }
  };
  /**
   * @Description:虚拟dom插入更新
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   * @param {Element} parent 挂载点
   */
  const patch = (oldNode, newNode, container) => {
    if (!oldNode) {
      // 没有旧节点，直接挂载
      mountElement(newNode, container);
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
