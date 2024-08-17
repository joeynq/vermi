import type { AnyPromiseFunction } from "@vermi/utils";
import type { AppContext } from "./Context";

export interface InterceptorMethods<Context extends AppContext> {
	intercept<Next extends AnyPromiseFunction>(
		context: Context,
		next: Next,
	): unknown;
}
