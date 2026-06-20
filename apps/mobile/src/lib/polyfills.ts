// Polyfill Blob and File for React Native / Expo to support ArrayBuffer and File API in libraries like UploadThing
const NativeBlob = global.Blob;
if (NativeBlob) {
  class CustomBlob extends NativeBlob {
    constructor(parts: any[] = [], options: any = {}) {
      const cleanParts = parts.map((part) => {
        if (part instanceof ArrayBuffer || ArrayBuffer.isView(part)) {
          return " ".repeat(part.byteLength);
        }
        return part;
      });
      super(cleanParts, options);
    }
  }
  global.Blob = CustomBlob as any;
}

if (typeof global.File === "undefined") {
  class File extends global.Blob {
    name: string;
    lastModified: number;
    constructor(parts: any[], name: string, options?: any) {
      super(parts, options);
      this.name = name;
      this.lastModified = options?.lastModified || Date.now();
    }
  }
  global.File = File as any;
}
