### Partial
Partial 作用是将传入的属性变为可选项
```JavaScript
type Partial<T> = { [P in keyof T]?: T[p] };
```

### Required
Required的作用是将传入的属性变为必选项
```JavaScript
type Required<T> = { [P in keyof T]-?: T[P]};
```

### Mutable（未包含）
```JavaScript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
```

### Readonly
将传入的属性变为只读选项
```JavaScript
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```

### Record
将K中的所有属性的值转化为T类型
```JavaScript
type Record<K extends keyof any, T> = { [P in K]: T};
```

### Pick
从T中取出一系列K的属性
```JavaScript
type Pick<T, K extends keyof T> = { [P in K]: T[P]}
```

### Exclude
从T中排除U
```JavaScript
type Exclude<T, U> = T extends U ? never : T;
```

### Extract
从T中提取U
```JavaScript
type Extract<T, U> = T extends U ? T : never;
```

### Omit（未包含）
```JavaScript
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

type Foo = Omit<{name: string, age: number}, 'name'>
```

### ReturnType
infer 在条件类型语句中，可以用infer声明一个类型变量并且对它进行使用。
```JavaScript
type ReturnType<T> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any;
```

### AxiosReturnType（未包含）
```JavaScript
import { AxiosPromise } from 'axios' // 导入接口
type AxiosReturnType<T> = T extends (...args: any[]) => AxiosPromise<infer R> ? R : any

type Resp = AxiosReturnType<Api>
```