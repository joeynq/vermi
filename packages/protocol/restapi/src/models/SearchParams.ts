import { Model, Prop } from "@vermi/schema";
import { Paging } from "./Paging";
import { Sort } from "./Sort";

// @ts-expect-error
@Model(undefined, { abstract: true })
export abstract class SearchParams<T> {
	abstract filter?: T;

	@Prop({ nullable: true })
	paging?: Paging;

	@Prop({ nullable: true })
	sort?: Sort;
}
