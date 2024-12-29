// 双端 diff 算法

function patchChildren(n1, n2, container) {
  if (typeof n2.children === "string") {
    // 省略
  } else if (Array.isArray(n2.children)) {
    patchKeyedChildren(n1, n2, container);
  } else {
    // 省略
  }
}

function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引值
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;

  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 增加两个判断分支，如果头尾部的节点为 undefined，则说明已经被处理过，直接跳到下一个位置
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx];
    } else if (oldStartVNode.key === newStartVNode.key) {
      // 步骤一：oldStartVNode 和 newStartVNode 比较
      patch(oldStartVNode, newStartVNode, container);
      // 更新索引值，并指向下一个位置
      oldStartVNode = oldChildren[++oldStartIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 步骤二：oldEndVNode 和 newEndVNode 比较
      // 都处于尾部，不需要移动，但是需要打补丁
      patch(oldEndVNode, newEndVNode, container);
      // 更新索引值，并指向上一个位置
      oldEndVNode = oldChildren[--oldEndIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 步骤三：oldStartVNode 和 newEndVNode 比较
      patch(oldStartVNode, newEndVNode, container);
      // 将旧的一组子节点的头部节点对应的真实 DOM 节点 oldStartVNode.el 移动到
      // 旧的一组子节点的尾部节点对应的真实 DOM 节点 oldEndVNode.el 之后
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling);
      // 更新索引值，并指向下一个位置
      oldStartVNode = oldChildren[++oldStartIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 步骤四：oldEndVNode 和 newStartVNode 比较
      patch(oldEndVNode, newStartVNode, container);
      // 移动节点
      // oldEndVNode.el 移动到 oldStartVNode.el 之前
      insert(oldEndVNode.el, container, oldStartVNode.el);

      // 更新索引值，并指向下一个位置
      oldEndVNode = oldChildren[--oldEndIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else {
      // 遍历旧的一组子节点，试图寻找与 newStartVNode.key 相同的节点
      // idxInOld 就是新的一组子节点的头部节点在旧的一组子节点中的索引值
      const idxInOld = oldChildren.findIndex(
        (node) => node.key === newStartVNode.key,
      );
      // idxInOld 大于 0，说明找到了可以复用的节点，并且需要将其对应的真实 DOM 移动到头部
      if (idxInOld > 0) {
        const vNodeToMove = oldChildren[idxInOld];
        patch(vNodeToMove, newStartVNode, container);
        // 将 vNodeToMove.el 移动到 oldStartVNode.el 之前
        insert(vNodeToMove.el, container, oldStartVNode.el);
        // 由于位置 idxInOld 处的节点所对应的真实 DOM 已经移动到别处，因此将其置为 undefined
        oldChildren[idxInOld] = undefined;
      } else {
        // 将 newStartVNode.el 插入到 oldStartVNode.el 之前
        patch(null, newStartVNode, container, oldStartVNode.el);
      }

      // 最后更新索引值，并指向下一个位置
      newStartVNode = newChildren[++newStartIdx];
    }
  }
}
