import requests
from websocket import create_connection
import json


class HyperionClient:
    api_key = 0
    uri = ""
    mode = "REST"
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

        if HyperionClient.mode == "REST":
            request = {"params": params}
            response = requests.post(
                f"http://{HyperionClient.uri}/model/generate/", json=request
            )
            response = response.json()
            return response
        elif HyperionClient.mode == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionClient.uri}")
            request = {"method": f"model.generate", "params": params}
            websocket.send(json.dumps(request))

            if stream == True and HyperionClient.stream_callback is not None:
                while True:
                    response = json.loads(websocket.recv())
                    HyperionClient.stream_callback(response)
                    if response.get("stream_end") == True:
                        break

            # Get the final complete output
            response = websocket.recv()
            response = json.loads(response)
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}

    def load_model(model_name, stream=False):
        params = {
            "model_name": model_name,
            "stream": stream,
        }
        if HyperionClient.mode == "REST":
            request = {"params": params}
            response = requests.post(
                f"http://{HyperionClient.uri}/model/load/", json=request
            )
            response = response.json()
            return response
        elif HyperionClient.mode == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionClient.uri}")
            request = {"method": f"model.load", "params": params}
            websocket.send(json.dumps(request))

            if stream == True and HyperionClient.stream_callback is not None:
                while True:
                    response = json.loads(websocket.recv())
                    HyperionClient.stream_callback(response)
                    if response.get("stream_end") == True:
                        break

            response = json.loads(websocket.recv())
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}

    def unload_model(model_name):
        params = {"model_name": model_name}
        if HyperionClient.mode == "REST":
            request = {"params": params}
            response = requests.post(
                f"http://{HyperionClient.uri}/model/unload/", json=request
            )
            response = response.json()
            return response
        elif HyperionClient.mode == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionClient.uri}")
            request = {"method": f"model.unload", "params": params}
            websocket.send(json.dumps(request))
            response = json.loads(websocket.recv())
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}

    def get_loaded_models():
        params = {}
        if HyperionClient.mode == "REST":
            response = requests.get(
                f"http://{HyperionClient.uri}/model/loaded/", json=request
            )
            response = response.json()
            return response
        elif HyperionClient.mode == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionClient.uri}")
            request = {"method": f"model.get_loaded"}
            websocket.send(json.dumps(request))
            response = json.loads(websocket.recv())
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}

    def get_cached_models():
        params = {}
        if HyperionClient.mode == "REST":
            response = requests.get(
                f"http://{HyperionClient.uri}/model/cached/", json=request
            )
            response = response.json()
            return response
        elif HyperionClient.mode == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionClient.uri}")
            request = {"method": f"model.get_cached"}
            websocket.send(json.dumps(request))
            response = json.loads(websocket.recv())
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}

    def tokenize(model_name, text):
        params = {
            "model_name": model_name,
            "text": text,
        }
        if HyperionClient.mode == "REST":
            request = {"params": params}
            response = requests.post(
                f"http://{HyperionClient.uri}/model/tokenize/", json=request
            )
            response = response.json()
            return response
        elif HyperionClient.mode == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionClient.uri}")
            request = {"method": f"model.tokenize", "params": params}
            websocket.send(json.dumps(request))
            response = json.loads(websocket.recv())
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}

    def detokenize(model_name, tokens):
        params = {
            "model_name": model_name,
            "tokens": tokens,
        }
        if HyperionClient.mode == "REST":
            request = {"params": params}
            response = requests.post(
                f"http://{HyperionClient.uri}/model/detokenize/", json=request
            )
            response = response.json()
            return response
        elif HyperionClient.mode == "WEBSOCKET":
            websocket = create_connection(f"ws://{HyperionClient.uri}")
            request = {"method": f"model.detokenize", "params": params}
            websocket.send(json.dumps(request))
            response = json.loads(websocket.recv())
            websocket.close()
            return response
        else:
            return {"success": "false", "error": "Unknown server mode"}
