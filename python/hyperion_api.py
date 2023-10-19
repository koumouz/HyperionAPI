import requests
from websocket import create_connection
import json


class HyperionAPI:
    api_key = 0
    uri = ""
    protocol = "REST"
    stream_callback = None

    def __init__(self, api_key=0, uri="", protocol="REST", stream_callback=None):
        self.api_key = api_key
        self.uri = uri
        self.protocol = protocol
        self.stream_callback = stream_callback

    def generate(
        self,
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

        if self.protocol == "REST":
            api_method = "model/generate/"
        else:
            api_method = "model.generate"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def load_model(self, model, stream=False):
        params = {
            "model": model,
            "stream": stream,
        }
        if self.protocol == "REST":
            api_method = "model/load"
        else:
            api_method = "model.load"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def unload_model(self, model):
        params = {"model": model}
        if self.protocol == "REST":
            api_method = "model/unload/"
        else:
            api_method = "model.unload"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def get_loaded_models(self):
        params = None
        if self.protocol == "REST":
            api_method = "model/loaded/"
        else:
            api_method = "model.get_loaded"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def get_cached_models(self):
        params = None
        if self.protocol == "REST":
            api_method = "model/cached/"
        else:
            api_method = "model.get_cached"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def create_embedding(self, model, input):
        params = {
            "model": model,
            "input": input,
        }
        if self.protocol == "REST":
            api_method = "embedding/create/"
        else:
            api_method = "embedding.create"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def tokenize(self, model, text):
        params = {
            "model": model,
            "text": text,
        }

        if self.protocol == "REST":
            api_method = "model/tokenize/"
        else:
            api_method = "model.tokenize"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def detokenize(self, model, tokens):
        params = {
            "model": model,
            "tokens": tokens,
        }
        if self.protocol == "REST":
            api_method = "model/detokenize/"
        else:
            api_method = "model.detokenize"

        try:
            response = self._call(api_method, params)
            return response
        except Exception as error:
            print(f"Hyperion API Error in {api_method}: ", error)
            response = {"success": "false", "error": str(error)}
            return response

    def _call(self, api_method, params=None, stream=False):
        if self.protocol == "REST":
            if params is None:
                response = requests.get(f"http://{self.uri}/{api_method}", json=request)
                response = response.json()
            else:
                request = {"params": params}
                response = requests.post(
                    f"http://{self.uri}/{api_method}", json=request
                )
                response = response.json()
            return response
        elif self.protocol == "WEBSOCKET":
            websocket = create_connection(f"ws://{self.uri}")
            request = {"method": f"{api_method}", "params": params}
            stream = params["stream"]
            websocket.send(json.dumps(request))

            if stream == True and self.stream_callback is not None:
                while True:
                    response = json.loads(websocket.recv())
                    self.stream_callback(response)
                    if response.get("stream_end") == True:
                        break

            # Get the final complete output
            response = websocket.recv()
            response = json.loads(response)
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}
