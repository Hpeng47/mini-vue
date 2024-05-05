### min-vue

实现 vue 的核心功能 响应式 模板编译 渲染

### proxy
有13个api：
1. get // 拦截对象属性的读取
2. set // 拦截对象属性的设置
3. has // 拦截对象属性的读取
4. deleteProperty // 拦截delete
5. ownKeys // 拦截Object.keys()
6. getPrototypeOf // 拦截Object.getPrototypeOf()
7. setPrototypeOf // 拦截Object.setPrototypeOf()
8. apply // 拦截函数的调用
9. construct // 拦截new
10. isExtensible // 拦截Object.isExtensible()
11. preventExtensions // 拦截Object.preventExtensions() 
12. getOwnPropertyDescriptor // 拦截Object.getOwnPropertyDescriptor()
13. defineProperty // 拦截Object.defineProperty()和Object.defineProperties()
proxy配合着Reflect一起使用，可以拦截到对象的操作