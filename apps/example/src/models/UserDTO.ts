import { Email, Model, Prop, String, Uuid } from "@vermi/openapi";
import { Resource, SearchParams } from "@vermi/restapi";

@Resource("User")
export class UserDTO {
	@Uuid()
	id!: string;

	@String({ maxLength: 255 })
	firstName!: string;

	@String({ maxLength: 255 })
	lastName!: string;

	@Email()
	email!: string;
}

@Model()
export class UserSearch extends SearchParams<UserDTO> {
	@Prop({ nullable: true, description: "Filter options" })
	filter?: UserDTO;
}
