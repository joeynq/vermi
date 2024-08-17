export async function isCached(
	headers: Request["headers"],
	etag: string,
	mtime: number,
) {
	if (
		headers.get("cache-control") &&
		headers.get("cache-control")?.indexOf("no-cache") !== -1
	) {
		return false;
	}

	const ifNoneMatch = headers.get("if-none-match");

	if (!ifNoneMatch) return false;

	if (ifNoneMatch === "*") return true;

	if (typeof etag !== "string") return false;

	if (ifNoneMatch === etag) return true;

	const ifModifiedSince = headers.get("if-modified-since");

	const lastModified = new Date(mtime);

	return (
		!ifModifiedSince || lastModified.getTime() <= Date.parse(ifModifiedSince)
	);
}

export async function generateETag(mtime: number) {
	return `W/"${mtime}"`;
}
