export type MaybePromise<T> = T | PromiseLike<T>;

/**
 * Represents the completion of an asynchronous operation that can be completed later.
 */
export class Deferred<T = any> implements PromiseLike<T> {
  private readonly promise: Promise<T>;
  private _resolve: (value: MaybePromise<T>) => void = () => {};
  private _reject: (reason?: any) => void = () => {};

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /**
   * Resolve this deferred promise with the given value.
   * @param the value to resolve
   */
  public readonly resolve = (value: MaybePromise<T>): void => {
    this._resolve(value);
  };

  /**
   * Reject this deferred promise with the given reason.
   * @param reason the reason to reject this deferred promise
   */
  public readonly reject = (reason?: any): void => {
    this._reject(reason);
  };

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  public readonly then = <TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => MaybePromise<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => MaybePromise<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> => {
    return this.promise.then(onfulfilled, onrejected);
  };

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  public readonly catch = <TResult = never>(
    onrejected?: ((reason: any) => MaybePromise<TResult>) | undefined | null
  ): Promise<T | TResult> => {
    return this.promise.catch(onrejected);
  };

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  public readonly finally = (onfinally?: (() => void) | undefined | null): Promise<T> => {
    return this.promise.finally(onfinally);
  };
}
