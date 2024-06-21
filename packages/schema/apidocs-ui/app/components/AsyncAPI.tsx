import { useEffect, useRef } from "react";

export interface AsyncAPIProps {
	specsUrl: string;
}

export const AsyncAPI = ({ specsUrl }: AsyncAPIProps) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		ref.current &&
			// @ts-ignore
			window.AsyncApiStandalone.render(
				{
					schema: {
						url: specsUrl,
						options: { method: "GET", mode: "cors" },
					},
					config: {
						show: {
							sidebar: true,
						},
					},
				},
				ref.current,
			);
	}, [specsUrl]);

	return (
		<>
			<div ref={ref} />
			<script src="https://unpkg.com/@asyncapi/react-component@latest/browser/standalone/index.js" />
		</>
	);
};
