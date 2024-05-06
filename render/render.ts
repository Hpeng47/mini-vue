/*
 * @Date: 2024-05-06 21:49:34
 * @LastEditors: hhp && 775621376@qq.com
 * @LastEditTime: 2024-05-07 00:18:10
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
 * @Description: 创建渲染函数
 * @Author: hehaipeng
 */
const createRender = () => {
  /**
   * @Description: 卸载
   * @Author: hehaipeng
   * @param {Vnode} vnode
   */
  const unmount = (vnode: Vnode) => {
    const parent = vnode.el.parentNode;
    if (parent) {
      parent.removeChild(vnode.el);
    }
    console.log(vnode);
  };

  /**
   * @Description: 插入元素
   * @Author: hehaipeng
   * @param {HTMLElement} el 节点
   * @param {HTMLElement} parent 父节点
   * @param {*} anchor // 插入元素位置 默认为null
   */
  const insertBefore = (
    el: HTMLElement,
    parent: HTMLElement,
    anchor = null
  ) => {
    parent.insertBefore(el, anchor);
  };

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
    vnode.el = root; // 挂载的时候把真实dom挂载到vnode上

    if (typeof vnode.children === "string") {
      setElementText(root, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((v) => {
        mountElement(v, root); // 递归调用自己 创建并挂载到当前节点
      });
    }

    insertBefore(root, container);
  };

  /**
   * @Description: 更新元素
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   */
  const patchElement = (oldNode, newNode) => {
    const el = (newNode.el = oldNode.el);
    patchChildren(oldNode, newNode, el);
  };

  /**
   * @Description: 更新子节点
   * @Author: hehaipeng
   * @param {Vnode} oldNode 旧节点
   * @param {Vnode} newNode 新节点
   * @param {Element} container 挂载点
   */
  const patchChildren = (oldNode, newNode, container) => {
    console.log(oldNode, newNode, container);
    oldNode.el = newNode.el;
    if (oldNode.children === newNode.children) {
      return;
    }
    if (typeof newNode.children === "string") {
      setElementText(container, newNode.children);
    } else if (Array.isArray(newNode.children)) {
      if (Array.isArray(oldNode.children)) {
        oldNode.children.forEach((c) => unmount(c));
        newNode.children.forEach((c) => patch(null, c, container));
      } else {
        // unmount(oldNode);
        setElementText(oldNode.el, "");
        newNode.children.forEach((c) => patch(null, c, container));
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
    console.log(oldNode, newNode, container);

    if (!oldNode) {
      // 挂载
      mountElement(newNode, container);
    } else {
      // 更新
      patchElement(oldNode, newNode);
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
      patch(container._vnode, vnode, container);
    }
    container._vnode = vnode; //挂载旧的虚拟dom
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
