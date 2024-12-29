// 简单 diff

interface VNode {
  type: string;
  children: string | VNode[];
  key?: string | number;
}

const oldVnode: VNode = {
  type: "div",
  children: [
    { type: "p", children: "1", key: 1 },
    { type: "p", children: "2", key: 2 },
    { type: "p", children: "3", key: 3 },
  ],
};

const newVnode: VNode = {
  type: "div",
  children: [
    { type: "p", children: "3", key: 3 },
    { type: "p", children: "1", key: 1 },
    { type: "p", children: "2", key: 2 },
  ],
};

function patchChildren(n1: VNode, n2: VNode, container: HTMLElement) {
  if (typeof n2.children === "string") {
    // 省略
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组子节点的更新方式
    // 新旧 children
    const oldChildren = n1.children;
    const newChildren = n2.children;

    // 用来存储寻找过程中遇到的最大索引值
    let lastIndex = 0;
    // 遍历新的 children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i];
      // 遍历旧的 children
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j];
        // 如果找到了相同 key 的节点，说明可以复用，但仍然需要调用 patch 函数更新
        if (newVNode.key === oldVNode.key) {
          // 调用 patch 函数更新该节点
          patch(oldVNode, newVNode, container);
          if (j < lastIndex) {
            // 如果当前找到的节点在旧 children 中的索引值小于最大索引值 lastIndex
            // 说明该节点对应的真实 DOM 需要移动
          } else {
            // 如果当前找到的节点在旧 children 中的索引不小于最大索引值
            // 更新最大索引值
            lastIndex = j;
          }
          break;
        }
      }
    }

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
