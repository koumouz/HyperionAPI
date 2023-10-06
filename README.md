# Hyperion

Hyperion is an AI Model Server. Effectively, it is to AI what Apache HTTPD is to the web. Hyperion hosts open source LLM and SD models and makes them accessible to applications via a simple REST or WebSocket API. The goal for Hyperion is to create a lightweight hosting environment for AI models and handle how they are loaded, how they are run and how prompts are translated to the model specific format. This allows developers to focus on their application and core logic, without needing to worry about the specifics of any individual AI model. In fact, through Hyperion, an application can mix and match models per prompt to choose the best model for the specific prompt they want to execute, without needing to worry about formatting or runtime considerations.

You can learn more about Hyperion here: https://github.com/FluentDynamics/Hyperion

## API
Libraries are provided for Python and JavaScript (initially) to allow for easy integration into applications. The API aims to be as similar as possible to the OpenAI API, so application development is as simple as possible.

Example:
```
import Hyperion

HyperionClient.api_key = “123”
HyperionClient.mode = "WEBSOCKET"
HyperionClient.uri = "127.0.0.1:5005"
response = HyperionClient.generate(
	model=”llama-2-13b-chat”,
	messages=[],
	stream=True,
	loader=”lamma.cpp”,
	temperature=0.5,
	top_p=1,
	top_k=50,
	do_sample=True,
)
```

The request format follows a simple structure:

```
[
	{“role”: “system”, “content”: “You are an intelligent assistant”},
	{“role”: “user”, “content”: “Hello Artemis, my name is Constantin”},
	{“role: “AI”, “content”: “Hello Constantin, nice to meet you”},
	{“role”: “user”, “content”: “What do you know about dogs?”},
]
```

The response format:
```
{
	"success": "true",
	"output": "I know a lot about dogs! Like they bark!",
	"prompt": "<s> [INST]<<SYS>>\nYou are a helpful and intelligent assistant named Luna <</SYS>>\n\nWhat do you know about dogs? [/INST]",
	"prompt_tokens": 36,
	"completion_tokens": 61,
	"execution_time": 1.9869191646575928,
	"tokens_per_second": 30.7,
	"method": "model.generate"
}
```
