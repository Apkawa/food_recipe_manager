import { builtinEnvironments } from "vitest/environments";

const jsdom = builtinEnvironments.jsdom;

type JsdomSetupParams = Parameters<typeof jsdom.setup>;

/**
 * jsdom environment that restores the host `AbortController`/`AbortSignal`
 * after jsdom populates the globals.
 *
 * jsdom ships its own `AbortController`/`AbortSignal` classes; on Node >= 23
 * the undici-backed `Request` rejects signals from another realm
 * ("RequestInit: Expected signal to be an instance of AbortSignal"), which
 * breaks `react-router` `createClientSideRequest` during navigation tests.
 */
export default {
  name: jsdom.name,
  transformMode: jsdom.transformMode,
  setupVM: jsdom.setupVM,
  async setup(global: JsdomSetupParams[0], options: JsdomSetupParams[1]) {
    const hostAbortController = global.AbortController;
    const hostAbortSignal = global.AbortSignal;
    const teardown = await jsdom.setup(global, options);
    global.AbortController = hostAbortController;
    global.AbortSignal = hostAbortSignal;
    // jsdom does not implement `matchMedia`; provide a minimal always-false
    // stub so components querying media features (e.g. `prefers-color-scheme`)
    // can render.
    global.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
    return teardown;
  },
};
