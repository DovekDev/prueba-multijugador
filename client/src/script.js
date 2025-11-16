const searchOptions = {
	apiKey: "AIzaSyDsIMOh4FuI1k3_LyxdmVYss1xsPqmdeP0",
	searchEngineId: "4350ac13a111c42b9",
	maxResults: 5,
	api: function (q) {
		return (
			"https://www.googleapis.com/customsearch/v1?q=" +
			q +
			"&cx=" + searchOptions.searchEngineId + 
			"&key=" + searchOptions.apiKey + 
			"&searchType=image" +
			"&num=" + searchOptions.maxResults
		);
	}
};

export async function search(query) {
	if (!query || query.length < 1) return [];

	try {
		const resp = await fetch(searchOptions.api(query));
		if (!resp.ok) {
			throw new Error("Error de API: " + resp.status + " " + resp.statusText);
		}
		const data = await resp.json();

		if (!data.items || data.items.length === 0) {
			return [];
		}

		return data.items.map(item => ({
			name: query,
			img: item.link,
			thumbnail: item.image.thumbnailLink
		}));
	} catch (error) {
		console.error("Hubo un error en la búsqueda de imágenes:", error);
		return [];
	}
}