// 简单 diff

interface VNode {
  type: string;
  children: string | VNode[];
}

const oldVnode: VNode = {
  type: "div",
  children: [
    { type: "p", children: "1" },
    { type: "p", children: "2" },
    { type: "p", children: "3" },
  ],
};

const newVnode: VNode = {
  type: "div",
  children: [
    { type: "p", children: "4" },
    { type: "p", children: "5" },
    { type: "p", children: "6" },
  ],
};

function patchChildren(n1: VNode, n2: VNode, container: HTMLElement) {
  if (typeof n1.children === "string") {
    // 省略
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组子节点的更新方式
    // 新旧 children
    const oldChildren = n1.children;
    const newChildren = n2.children;
    const oldLength = oldChildren.length;
    const newLength = newChildren.length;
    // 获取两组 children 的较小长度
    const commonLength = Math.min(oldLength, newLength);

    for (let i = 0; i < commonLength; i++) {
      // 调用 patch 函数逐个更新子节点
      patch(oldChildren[i], newChildren[i]);
    }

    if (newLength > oldLength) {
      // 新 children 长度大于旧 children 长度
      for (let i = commonLength; i < newLength; i++) {
        // 创建新节点并插入到容器中
        patch(null, newChildren[i], container);
      }
    } else if (newLength < oldLength) {
      // 新 children 长度小于旧 children 长度
      for (let i = commonLength; i < oldLength; i++) {
        unmount(oldChildren[i]);
      }
    }
  } else {
    // 省略
  }
}
