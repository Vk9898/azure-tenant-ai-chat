# 💡🔗 Extensions

With Extensions, you can enhance the functionality of Tenant AI Chat by integrating it with your internal APIs or external resources.Extensions are created using OpenAI Tools, specifically through Function Calling.

As a user, you have the ability to create extensions that call your own internal APIs or external resources. However, if you are an admin, you can create extensions that can be utilised by all users within your organization.

Refer to the [OpenAI Tools](https://platform.openai.com/docs/guides/function-calling) documentation for more information on how tools and functions call works.

Tenant AI Chat expects the following from the function definition:

```json
{
  "name": "FunctionName",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Query parameters",
        "properties": {
          // Query parameters
        },
        "required": [
          // comma separated parameters of the required query parameters
        ]
      },
      "body": {
        "type": "object",
        "description": "Body of the...",
        "properties": {
          // Body parameters
        },
        "required": [
          // comma separated parameters of the required body parameters
        ]
      }
    },
    "required": [
      // query or body are optional however at least one of them must be required e.g. ["query"] or ["body"] or ["query", "body"]
    ]
  },
  "description": "Description of the function"
}
```