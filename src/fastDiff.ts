function patchKeyedChildren(n1, n2, container) {
  const newChildren = n2.children;
  const oldChildren = n1.children;

  let j = 0;
  let oldVNode = oldChildren[j];
  let newVNode = newChildren[j];
  // while 循环向后遍历，直到遇到不同 key 的节点为止
  while (oldVNode.key === newVNode.key) {
    patch(oldVNode, newVNode, container);
    j++;
    oldVNode = oldChildren[j];
    newVNode = newChildren[j];
  }

  let oldEnd = oldChildren.length - 1;
  let newEnd = newChildren.length - 1;
  oldVNode = oldChildren[oldEnd];
  newVNode = newChildren[newEnd];
  // while 循环向前遍历，直到遇到不同 key 的节点为止
  while (oldVNode.key === newVNode.key) {
    patch(oldVNode, newVNode, container);
    oldEnd--;
    newEnd--;
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
  }

  // 预处理完成后，如果满足以下条件，则说明从 j --> newEnd 的节点应作为新节点插入
  if (j > oldEnd && j <= newEnd) {
    // 锚点索引
    const anchorIndex = newEnd + 1;
    // 锚点元素
    const anchor =
      anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
    // 采用 while 循环，调用 patch 函数逐个挂载新增节点
    while (j <= newEnd) {
      patch(null, newChildren[j++], container, anchor);
    }
  } else if (j > newEnd && j <= oldEnd) {
    // j --> oldEnd 的节点应该被移除
    while (j <= oldEnd) {
      unmount(oldChildren[j++]);
    }
  } else {
    // 构造 source 数组, 用于存储新的一组子节点中每个节点在旧的一组子节点中的位置
    // 新的一组子节点中剩余未处理节点的数量
    const count = newEnd - j + 1;
    const source = new Array(count);
    source.fill(-1);

    const oldStart = j;
    const newStart = j;
    // 构建索引表
    const keyIndex: {
      [key: string]: number;
    } = {};
    for (let i = newStart; i <= newEnd; i++) {
      keyIndex[newChildren[i].key] = i;
    }
    for (let i = oldStart; i < oldEnd; i++) {
      const oldVNode = oldChildren[i];

      const k = keyIndex[oldVNode.key];
      if (typeof k !== "undefined") {
        newVNode = newChildren[k];
        patch(oldVNode, newVNode, container);
        source[k - newStart] = i;
      } else {
        unmount(oldVNode);
      }

      for (let k = newStart; k < newEnd; k++) {
        const newVNode = newChildren[k];

        if (oldVNode.key === newVNode.key) {
          patch(oldVNode, newVNode, container);
          source[k - newStart] = i;
          break;
        }
      }
    }
  }
}
