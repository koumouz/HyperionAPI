const WebSocket = require("ws");

class HyperionAPI {
	constructor({ apiKey = 0, uri = "", protocol = "REST", streamCallback = null } = {}) {
		this.apiKey = apiKey;
		this.uri = uri;
		this.protocol = protocol;
		this.streamCallback = streamCallback;
	}

	async generate({
		model = "",
		messages = [],
		stream = false,
		maxNewTokens = null,
		temperature = null,
		doSample = null,
		topP = null,
		topK = null,
		repetitionPenalty = null,
		lengthPenalty = null,
	} = {}) {
		let params = {
			model: model,
			messages: messages,
			stream: stream,
			max_new_tokens: maxNewTokens,
			temperature: temperature,
			do_sample: doSample,
			top_p: topP,
			top_k: topK,
			repetition_penalty: repetitionPenalty,
			length_penalty: lengthPenalty,
		};

		// Filter out parameters with null values
		for (const key in params) {
			if (params[key] === null) {
				delete params[key];
			}
		}

		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "model/generate/";
		} else {
			apiMethod = "model.generate";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async loadModel({ model = "", stream = false } = {}) {
		let params = {
			model: model,
			stream: stream,
		};

		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "model/load/";
		} else {
			apiMethod = "model.load";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async unloadModel({ model = "" } = {}) {
		let params = { model: model };

		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "model/unload/";
		} else {
			apiMethod = "model.unload";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async getLoadedModels() {
		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "model/loaded/";
		} else {
			apiMethod = "model.loaded";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async getCachedModels() {
		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "model/cached/";
		} else {
			apiMethod = "model.cached";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async createEmbedding({ model = "", input = "" } = {}) {
		let params = {
			model: model,
			input: input,
		};

		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "embedding/create/";
		} else {
			apiMethod = "embedding.create";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async tokenize({ model = "", text = "" } = {}) {
		let params = {
			model: model,
			text: text,
		};

		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "model/tokenize/";
		} else {
			apiMethod = "model.tokenize";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async detokenize({ model = "", tokens = [] } = {}) {
		let params = {
			model: model,
			tokens: tokens,
		};

		let apiMethod = "";
		if (this.protocol === "REST") {
			apiMethod = "model/detokenize/";
		} else {
			apiMethod = "model.detokenize";
		}

		try {
			const response = await this._call(apiMethod, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in " + apiMethod + ": ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async _call(apiMethod, params = null) {
		if (this.protocol === "REST") {
			const request = { params: params };
			let response = null;
			if (params !== null) {
				response = await fetch("http://${this.uri}/" + apiMethod, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(request),
				});
			} else {
				response = await fetch(`http://${this.uri}/model/cached/`, {
					method: "GET",
				});
			}
			const jsonResponse = await response.json();
			return jsonResponse;
		} else if (this.protocol === "WEBSOCKET") {
			return new Promise((resolve, reject) => {
				const websocket = new WebSocket(`ws://${this.uri}`);
				const request = { method: apiMethod, params: params };
				const stream = params && "stream" in params ? params.stream : false;
				websocket.onopen = () => {
					websocket.send(JSON.stringify(request));
				};
				websocket.onmessage = (event) => {
					const response = JSON.parse(event.data);
					// Only send streamed tokens to the callback. Do not close the socket
					// until the stream ends and we received the final response.
					if (stream === true && this.streamCallback !== null && response.stream_end != null) {
						this.streamCallback(response);
					}

					// This is the final response, so close the websocket
					// and resolve the promise
					if (response.success == "true" || response.success == "false") {
						resolve(response);
						websocket.close();
					}
				};
				websocket.onerror = (err) => {
					reject(err);
				};
			});
		} else {
			return { success: "false", error: "Unknown server mode" };
		}
	}
}

module.exports = HyperionAPI;
