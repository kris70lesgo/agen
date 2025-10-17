/// <reference types="react" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

export {};
