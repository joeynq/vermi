import { Integer, Model } from "@vermi/schema";

@Model()
export class Paging {
	@Integer({
		minimum: 0,
		maximum: 9999,
		default: 0,
		description: "Page number.",
	})
	page = 0;

	@Integer({
		minimum: 1,
		maximum: 100,
		default: 20,
		description: "Number of objects per page.",
	})
	size = 20;

	@Integer({
		readOnly: true,
		description: "Number of objects to skip.",
		minimum: 0,
		maximum: 999999,
	})
	get offset() {
		return this.page ? this.page * this.limit : 0;
	}

	@Integer({
		readOnly: true,
		description: "Maximum number of objects to return.",
		minimum: 1,
		maximum: 100,
		default: 20,
	})
	get limit() {
		return this.size;
	}
}
