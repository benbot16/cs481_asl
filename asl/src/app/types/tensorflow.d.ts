import Long from 'long';

// Add Long type for TensorFlow.js hash utils
declare module '@tensorflow/tfjs-core/dist/hash_util' {
  export function hexToLong(hex: string): Long;
  export function fingerPrint64(s: Uint8Array, len?: number): Long;
}

// Extend PyJsonValue interface to accept any type
declare module '@tensorflow/tfjs-layers/dist/keras_format/types' {
  interface PyJsonDict {
    [key: string]: any;
  }
}

// Make Shape type compatible
declare module '@tensorflow/tfjs-core' {
  interface Shape extends Array<number | null> {}
}

// Fix ModelTensorInfo compatibility
declare module '@tensorflow/tfjs-core/dist/model' {
  interface ModelTensorInfo {
    name: string;
    shape: Array<number | null>;
    dtype: string;
  }
}

// Add type overrides for SymbolicTensor
declare module '@tensorflow/tfjs-layers/dist/engine/topology' {
  interface SymbolicTensor {
    shape: Array<number | null>;
  }
}