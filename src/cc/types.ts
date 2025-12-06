/**
 * Cocos Creator 组件属性类型定义
 */

// 属性值类型
export interface PropValue<T = any> {
  value: T;
  values?: T[];
  name?: string;
  type?: string;
  path?: string;
}

// 资源引用类型
export interface AssetRef {
  uuid: string;
}

// 属性基础类型
export interface PropAttrs {
  visible?: boolean;
}

// 组件属性类型
export interface ComponentProp {
  compType: string;
  attrs: PropAttrs;
  uuid: PropValue<string>;
  [key: string]: any;
}

// 基础 Target 类型
export interface BaseTarget {
  uuid: PropValue<string>;
  [key: string]: PropValue | any;
}

// cc.Mask 类型枚举
export const MaskType = {
  RECT: 0,
  ELLIPSE: 1,
  IMAGE_STENCIL: 2,
} as const;

// cc.Sprite 类型枚举
export const SpriteType = {
  SIMPLE: 0,
  SLICED: 1,
  TILED: 2,
  FILLED: 3,
} as const;

export const SpriteFillType = {
  HORIZONTAL: 0,
  VERTICAL: 1,
  RADIAL: 2,
} as const;

// 模拟 cc 全局对象
export const cc = {
  Mask: {
    Type: MaskType,
  },
  Sprite: {
    Type: SpriteType,
    FillType: SpriteFillType,
  },
  macro: {
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
  },
  Color: class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r = 0, g = 0, b = 0, a = 255) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }
  },
  assetManager: {
    loadAny(uuid: string, callback: (err: Error | null, asset: any) => void) {
      console.log('[cc.assetManager.loadAny]', uuid);
      // 模拟异步加载
      setTimeout(() => {
        callback(null, { nativeUrl: `/mock/path/${uuid}` });
      }, 100);
    },
  },
};

// 挂载到全局
if (typeof window !== 'undefined') {
  (window as any).cc = cc;
}
