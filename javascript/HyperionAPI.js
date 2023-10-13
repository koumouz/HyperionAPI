const WebSocket = require('ws');

class HyperionAPI {
    static apiKey = 0;
    static uri = "";
    static mode = "REST";
    static streamCallback = null;

    constructor({ apiKey = 0, uri = "", protocol = "REST", streamCallback = null } = {}) {
        HyperionAPI.apiKey = apiKey;
        HyperionAPI.uri = uri;
        HyperionAPI.protocol = protocol;
        HyperionAPI.streamCallback = streamCallback;
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
        if (HyperionAPI.protocol === "REST") {
            method = "model/generate/"
        } else {
            method = "model.generate"
        }

        return await this._call(method, params, stream);
    }


    async loadModel({ model = "", stream = false } = {}) {
        let params = {
            model: model,
            stream: stream,
        };

        let method = "";
        if (HyperionAPI.protocol === "REST") {
            method = "model/load/"
        } else {
            method = "model.load"
        }

        return await this._call(method, params);
    }

    async unloadModel({ model = "" } = {}) {
        let params = { model: model };

        let method = "";
        if (HyperionAPI.protocol === "REST") {
            method = "model/unload/"
        }
        else {
            method = "model.unload"
        }

        return await this._call(method, params);
    }

    async getLoadedModels() {
        let method = "";
        if (HyperionAPI.protocol === "REST") {
            method = "model/loaded/"
        }
        else {
            method = "model.loaded"
        }

        return await this._call(method);
    }

    async getCachedModels() {
        let method = "";
        if (HyperionAPI.protocol === "REST") {
            method = "model/cached/"
        }
        else {
            method = "model.cached"
        }

        return await this._call(method);
    }

    async tokenize({ model = "", text = "" } = {}) {
        let params = {
            model: model,
            text: text,
        };

        let method = "";
        if (HyperionAPI.protocol === "REST") {
            method = "model/tokenize/"
        }
        else {
            method = "model.tokenize"
        }

        return await this._call(method, params);
    }

    async detokenize({ model = "", tokens = [] } = {}) {
        let params = {
            model: model,
            tokens: tokens,
        };

        let method = "";
        if (HyperionAPI.protocol === "REST") {
            method = "model/detokenize/"
        } else {
            method = "model.detokenize"
        }

        return await this._call(method, params);
    }

    async _call(apiMethod, params = null, stream = false) {
        if (HyperionAPI.protocol === "REST") {
            const request = { params: params };
            let response = null;
            if (params !== null) {
                response = await fetch(
                    "http://${HyperionAPI.uri}/" + apiMethod,
                    {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(request),
                    }
                );
            } else {
                response = await fetch(
                    `http://${HyperionAPI.uri}/model/cached/`,
                    {
                        method: "GET",
                    }
                );
            }
            const jsonResponse = await response.json();
            return jsonResponse;
        }
        else if (HyperionAPI.protocol === "WEBSOCKET") {
            return new Promise((resolve, reject) => {
                const websocket = new WebSocket(`ws://${HyperionAPI.uri}`);
                const request = { method: apiMethod, params: params };
                websocket.onopen = () => {
                    websocket.send(JSON.stringify(request));
                };
                websocket.onmessage = (event) => {
                    const response = JSON.parse(event.data);
                    // Only send streamed tokens to the callback
                    if (stream === true && HyperionAPI.streamCallback !== null && response.stream_end != null) {
                        HyperionAPI.streamCallback(response);
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
        }
        else {
            return { success: "false", error: "Unknown server mode" };
        }
    }
}

module.exports = HyperionAPI;