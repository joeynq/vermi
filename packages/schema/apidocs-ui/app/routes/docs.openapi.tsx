import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

interface Context {
	specsUrl: string;
}

export async function loader({ context }: LoaderFunctionArgs) {
	return json(context.data as Context);
}

export default function OpenAPI() {
	const { specsUrl } = useLoaderData<Context>();

	return (
		<ApiReferenceReact
			configuration={{
				spec: {
					url: specsUrl,
				},
			}}
		/>
	);
}
