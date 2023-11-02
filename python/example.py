# shell.py is a simple example on how to use the HyperionClient library to interact with Hyperion
# It covers the basic methods and functions of the API

import colorama
from colorama import Fore, Style
from hyperion_api import HyperionAPI


class Terminal:
    HUMAN_TEXT_COLOR = Fore.WHITE
    AI_TEXT_COLOR = Fore.CYAN
    SYSTEM_TEXT_COLOR = Fore.LIGHTYELLOW_EX
    ERROR_TEXT_COLOR = Fore.RED
    INFO_TEXT_COLOR = Fore.GREEN

    @staticmethod
    def output(message, type="SYSTEM"):
        colorama.init()

        text_color = Fore.WHITE
        if type == "HUMAN":
            text_color = Terminal.HUMAN_TEXT_COLOR
        elif type == "AI":
            text_color = Terminal.AI_TEXT_COLOR
        elif type == "INFO":
            text_color = Terminal.INFO_TEXT_COLOR
        elif type == "SYSTEM":
            text_color = Terminal.SYSTEM_TEXT_COLOR
        elif type == "ERROR":
            text_color = Terminal.ERROR_TEXT_COLOR

        print(f"{text_color}{message}{Style.RESET_ALL}")

    @staticmethod
    def input(message):
        text = input(Terminal.INFO_TEXT_COLOR + message + Style.RESET_ALL)
        return text


def streaming_callback(response):
    text = response.get("token")
    stream_end = response.get("stream_end")
    print(
        f"{Terminal.AI_TEXT_COLOR}{text}{Style.RESET_ALL}",
        flush=True,
        end="" if not stream_end else None,
    )


def main():
    Terminal.output(
        "Starting Hyperion Example Client. Type 'quit' to exit the application.",
        "SYSTEM",
    )

    api = HyperionAPI(
        api_key=0,
        uri="127.0.0.1:5005",
        protocol="WEBSOCKET",
        stream_callback=streaming_callback,
    )

    messages = [
        {
            "role": "system",
            "content": "You are a helpful and intelligent assistant named Luna",
        }
    ]

    while True:
        command = Terminal.input("> ")
        model = "llama-2-13b-chat"
        # model = "llama-2-7b-chat"
        # model = "mistral-7b-instruct-v0.1"
        # model = "gpt-4"

        if "prompt: " in command:
            prompt = command.split("prompt: ")[1]
            messages.append({"role": "user", "content": prompt})
            stream = True
            response = api.generate(model, messages, stream=stream)
            if response.get("success", "").lower() == 'false':
                Terminal.output(response.get("error"), "ERROR")
                continue
            else:
                output = response.get("output")
                messages.append({"role": "assistant", "content": output})
                Terminal.output(response, "INFO")
                # only print the final output if we are not streaming. Otherwise it's duplicated
                if stream == False:
                    Terminal.output(output, "AI")
        elif "method: " in command:
            method = command.split("method: ")[1]

            if method == "load_model":
                params = Terminal.input("params: ")
                response = api.load_model("model name: ", stream=False)
            elif method == "unload_model":
                params = Terminal.input("model name: ")
                response = api.unload_model(params)
            elif method == "get_loaded_models":
                response = api.get_loaded_models()
            elif method == "get_cached_models":
                response = api.get_cached_models()
            elif method == "create_embedding":
                # text-embedding-ada-002
                # llama-2-13b-chat
                # all-MiniLM-L6-v2
                response = api.create_embedding(
                    model="text-embedding-ada-002", input="hello world"
                )
            elif method == "tokenize":
                response = api.tokenize("llama-2-13b-chat", "hello world")
            elif method == "detokenize":
                response = api.detokenize("llama-2-13b-chat", [1, 22172, 3186])
            else:
                Terminal.output("Unknown method: " + method, "ERROR")
                continue

            Terminal.output(response, "INFO")
        elif command == "quit" or command == "exit":
            break


# And here we go!
if __name__ == "__main__":
    main()
