import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AsyncAPI } from "~/components/AsyncAPI";

interface Context {
	specsUrl: string;
}

export const links: LinksFunction = () => {
	return [
		{
			rel: "stylesheet",
			href: "https://unpkg.com/@asyncapi/react-component@latest/styles/default.min.css",
		},
	];
};

export async function loader({ context }: LoaderFunctionArgs) {
	return json(context.data as Context);
}

export default function OpenAPI() {
	const { specsUrl } = useLoaderData<Context>();

	return <AsyncAPI specsUrl={specsUrl} />;
}
