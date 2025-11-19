const searchOptions = {
	apiKeys: [
		"AIzaSyDsIMOh4FuI1k3_LyxdmVYss1xsPqmdeP0",
		"AIzaSyDZ0kUMBodel1xuln9rk_DStkCRnW7QyzQ"
	],
	searchEngineIds: [
		"4350ac13a111c42b9",
		"54ec56ba3b5b1445c"
	],
	maxResults: 5,
};

let currentKeyIndex = 0;
let currentEngineIndex = 0;

function getCredentials() {
	const key = searchOptions.apiKeys[currentKeyIndex];
	const engine = searchOptions.searchEngineIds[currentEngineIndex];
	return { key, engine };
}

function rotateCredentials() {
	currentKeyIndex = (currentKeyIndex + 1) % searchOptions.apiKeys.length;
	if (currentKeyIndex === 0) {
		currentEngineIndex = (currentEngineIndex + 1) % searchOptions.searchEngineIds.length
	}
};

function buildApiUrl(q) {
	const { key, engine } = getCredentials();
	return (
		"https://www.googleapis.com/customsearch/v1?q=" +
		q +
		"&cx=" + engine + 
		"&key=" + key + 
		"&searchType=image" +
		"&num=" + searchOptions.maxResults
	);
};

export async function search(query) {
	if (!query || query.length < 1) return [];

	try {
		const resp = await fetch(buildApiUrl(query));
		if (!resp.ok) {
			console.warn("Error de API:", resp.status, resp.statusText);
			rotateCredentials();
			const retryResp = await fetch(buildApiUrl(query));
			if (!retryResp.ok) throw new Error("Error de API tras reintento");
			const retryData = await retryResp.json();
			return formatResults(query, retryData);
		}
		const data = await resp.json();
		return formatResults(query, data);
	} catch (error) {
		console.error("Hubo un error en la búsqueda de imágenes:", error);
		return [];
	}
}

function formatResults(query, data) {
	if (!data.items || data.items.length === 0) {
		return [];
	}
	return data.items.map(item => ({
		name: query,
		img: item.link,
		thumbnail: item.image?.thumbnailLink || item.link
	}));
}