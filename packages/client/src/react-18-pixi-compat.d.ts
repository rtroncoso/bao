import type { PropsWithChildren, ReactNode } from 'react';

declare module 'react' {
  // @inlet/react-pixi types rely on React 17 FC children behavior.
  interface FunctionComponent<P = Record<string, unknown>> {
    (props: PropsWithChildren<P>, deprecatedLegacyContext?: unknown): ReactNode;
  }
}
