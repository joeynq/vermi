import type { AppEvents } from "../events";
import { Hook } from "./Hook";

export const AppHook = Hook<typeof AppEvents>;
