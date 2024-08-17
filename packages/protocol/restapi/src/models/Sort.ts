import { Model, Pattern, StringEnum } from "@vermi/schema";

export enum SortDirection {
	Ascending = "asc",
	Descending = "desc",
}

@Model()
export class Sort {
	@Pattern(/^[a-zA-Z0-9_]+$/, {
		maxLength: 255,
		minLength: 1,
	})
	prop!: string;

	@StringEnum(SortDirection, { default: SortDirection.Ascending })
	direction: SortDirection = SortDirection.Ascending;
}
