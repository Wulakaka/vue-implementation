let activeEffect: () => void;

function effect(fn: () => void) {
  activeEffect = fn;
  fn();
}

const bucket = new Set<() => void>();

const data = { text: "hello world" };

const obj = new Proxy(data, {
  get(target: { text: string }, key: string | symbol) {
    activeEffect && bucket.add(activeEffect);
    // 为啥会出现 Reflect
    return target[key as keyof typeof target];
  },
  set(target: { text: string }, key: string | symbol, newVal: string) {
    target[key as keyof typeof target] = newVal;
    bucket.forEach((fn) => fn());
    return true;
  },
});

effect(() => {
  document.body.innerText = obj.text;
});

setTimeout(() => {
  obj.text = "hello vue3";
}, 1000);
