import requests
from websocket import create_connection
import json


class HyperionAPI:
    api_key = 0
    uri = ""
    protocol = "REST"
    stream_callback = None

    def generate(
        model,
        messages,
        stream=False,
        **kwargs,
    ):
        params = {
            "model": model,
            "messages": messages,
            "stream": stream,
        }
        params.update(kwargs)

        if HyperionAPI.protocol == "REST":
            api_method = "mode/generate/"
        else:
            api_method = "model.generate"

        return HyperionAPI._call(api_method, params, stream)

    def load_model(model_name, stream=False):
        params = {
            "model_name": model_name,
            "stream": stream,
        }
        if HyperionAPI.mode == "REST":
            api_method = "model/load"
        else:
            api_method = "model.load"

        return HyperionAPI._call(api_method, params, stream)

    def unload_model(model_name):
        params = {"model_name": model_name}
        if HyperionAPI.mode == "REST":
            api_method = "model/unload/"
        else:
            api_method = "model.unload"

        return HyperionAPI._call(api_method, params)

    def get_loaded_models():
        params = None
        if HyperionAPI.protocol == "REST":
            api_method = "model/loaded/"
        else:
            api_method = "model.get_loaded"

        return HyperionAPI._call(api_method, params)

    def get_cached_models():
        params = None
        if HyperionAPI.protocol == "REST":
            api_method = "model/cached/"
        else:
            api_method = "model.get_cached"

        return HyperionAPI._call(api_method, params)

    def tokenize(model_name, text):
        params = {
            "model_name": model_name,
            "text": text,
        }

        if HyperionAPI.protocol == "REST":
            api_method = "model/tokenize/"
        else:
            api_method = "model.tokenize"

        return HyperionAPI._call(api_method, params)

    def detokenize(model_name, tokens):
        params = {
            "model_name": model_name,
            "tokens": tokens,
        }
        if HyperionAPI.protocol == "REST":
            api_method = "model/detokenize/"
        else:
            api_method = "model.detokenize"

        return HyperionAPI._call(api_method, params)

    def _call(api_method, params=None, stream=False):
        if HyperionAPI.protocol == "REST":
            if params is None:
                response = requests.get(
                    f"http://{HyperionAPI.uri}/{api_method}", json=request
                )
                response = response.json()
            else:
                request = {"params": params}
                response = requests.post(
                    f"http://{HyperionAPI.uri}/{api_method}", json=request
                )
                response = response.json()
            return response
        elif HyperionAPI.protocol == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionAPI.uri}")
            request = {"method": f"{api_method}", "params": params}
            websocket.send(json.dumps(request))

            if stream == True and HyperionAPI.stream_callback is not None:
                while True:
                    response = json.loads(websocket.recv())
                    HyperionAPI.stream_callback(response)
                    if response.get("stream_end") == True:
                        break

            # Get the final complete output
            response = websocket.recv()
            response = json.loads(response)
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}
