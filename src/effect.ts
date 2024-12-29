let activeEffect: () => void;

function effect(fn: () => void) {
  activeEffect = fn;
  fn();
}

const bucket = new WeakMap();

const data = { text: "hello world" };

const obj = new Proxy(data, {
  get(target: { text: string }, key) {
    // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
    track(target, key);

    // 返回属性值
    // 为啥会出现 Reflect?
    return target[key as keyof typeof target];
  },
  set(target: { text: string }, key: string | symbol, newVal: string) {
    target[key as keyof typeof target] = newVal;
    // 把副作用函数从桶中取出来执行
    trigger(target, key);
    return true;
  },
});

effect(() => {
  document.body.innerText = obj.text;
});

setTimeout(() => {
  obj.text = "hello vue3";
}, 1000);

function track(target: object, key: string | symbol) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  // 如果不存在 depsMap，就创建一个 Map 并与 target 关联
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  // 再根据 key 获取 depsMap 中的 deps，它是一个 Set
  // 里面存储着所有与当前 key 相关的副作用函数： effects
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
}

// 再 set 拦截函数内调用 trigger 函数触发变化
function trigger(target: object, key: string | symbol) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  if (effects) {
    effects.forEach((effect: () => void) => effect());
  }
}
