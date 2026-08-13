/**
 * Brand symbol shared by signals, computeds and binding refs, so `isRef` does
 * not rely on alien-signals' function-name based checks (which can break under
 * minification).
 */
export const REF_BRAND = Symbol('isRef')

/**
 * Signal setter is intentionally bivariant (`value: any`): reads stay strictly
 * typed via the getter, while writes accept anything so that `Signal<number>`
 * remains assignable to `MaybeRef<JsonPrimitive>` / prop types — matching how
 * Vue's covariant `Ref<T>` behaved.
 *
 * The `[REF_BRAND]` property is set at runtime by `brandSignal`, and makes the
 * type structurally distinct from plain functions: only real signals match the
 * `Signal` branch of `MaybeRef` / `WatchSource`, so type-level inference stays
 * unambiguous.
 */
export type Signal<T> = {
  (): T
  (value: any): void
  [REF_BRAND]: true
}

export type MaybeRef<T> = T | Signal<T>

export type ToMaybeRef<T> = T extends {}
  ? {
      [key in keyof T]: MaybeRef<T[key]>
    }
  : MaybeRef<T>

export type UnRef<T> = T extends Signal<infer U> ? U : T

// ---------------- watch ----------------

export type WatchSource<T = any> = Signal<T> | (() => T)

export type WatchEffect = () => void

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: (cleanupFn: () => void) => void,
) => void

export type WatchScheduler = (job: () => void, isFirstRun: boolean) => void

export interface WatchOptions<Immediate = boolean> {
  /**
   * Run the callback immediately when the watcher is created.
   */
  immediate?: Immediate

  /**
   * Traverse the source deeply to detect changes.
   * Note: without deep reactive proxies, nested mutations of plain objects
   * do not trigger; the watcher fires when the root value changes.
   */
  deep?: boolean

  /**
   * 'pre' (default) runs the callback before the effect/render queue,
   * 'post' runs it after, 'sync' invokes the callback synchronously on
   * each change (multiple synchronous writes each trigger the callback;
   * a write performed inside the callback is coalesced into the next run
   * rather than re-entering).
   */
  flush?: 'pre' | 'post' | 'sync'

  /**
   * Custom scheduler for the callback.
   */
  scheduler?: WatchScheduler
}

export type WatchHandle = () => void
