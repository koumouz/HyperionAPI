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

		let method = "";
		if (this.protocol === "REST") {
			method = "model/generate/";
		} else {
			method = "model.generate";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in generate: ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async loadModel({ model = "", stream = false } = {}) {
		let params = {
			model: model,
			stream: stream,
		};

		let method = "";
		if (this.protocol === "REST") {
			method = "model/load/";
		} else {
			method = "model.load";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in loadModel: ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async unloadModel({ model = "" } = {}) {
		let params = { model: model };

		let method = "";
		if (this.protocol === "REST") {
			method = "model/unload/";
		} else {
			method = "model.unload";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in unloadModel: ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async getLoadedModels() {
		let method = "";
		if (this.protocol === "REST") {
			method = "model/loaded/";
		} else {
			method = "model.loaded";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in getLoadedModels: ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async getCachedModels() {
		let method = "";
		if (this.protocol === "REST") {
			method = "model/cached/";
		} else {
			method = "model.cached";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in getCachedModels: ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async createEmbedding({ model = "", input = "" } = {}) {
		let params = {
			model: model,
			input: input,
		};

		let method = "";
		if (this.protocol === "REST") {
			method = "embedding/create/";
		} else {
			method = "embedding.create";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in createEmbedding: ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async tokenize({ model = "", text = "" } = {}) {
		let params = {
			model: model,
			text: text,
		};

		let method = "";
		if (this.protocol === "REST") {
			method = "model/tokenize/";
		} else {
			method = "model.tokenize";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in tokenize: ", error.message);
			const response = { success: "false", error: error.message };
			return response;
		}
	}

	async detokenize({ model = "", tokens = [] } = {}) {
		let params = {
			model: model,
			tokens: tokens,
		};

		let method = "";
		if (this.protocol === "REST") {
			method = "model/detokenize/";
		} else {
			method = "model.detokenize";
		}

		try {
			const response = await this._call(method, params);
			return response;
		} catch (error) {
			console.log("Hyperion API Error in detokenize: ", error.message);
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
				const stream = params.stream;
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
