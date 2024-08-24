import type { VermiModuleMethods } from "../interfaces";
import type { Configuration } from "./Configuration";

export abstract class VermiModule<Options>
	implements VermiModuleMethods<Options>
{
	readonly config!: Options[];
	protected configuration!: Configuration;
}
