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

## Web Search Extension Templates

Tenant AI Chat can be enhanced with web search capabilities through extensions that leverage OpenAI's function calling API. Below are template extensions you can use to enable web search functionality in your chats.

### Basic Web Search Extension

```json
{
  "name": "web_search",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Web search query parameters",
        "properties": {
          "search_term": {
            "type": "string",
            "description": "The search term to look up on the web"
          },
          "num_results": {
            "type": "number",
            "description": "Number of search results to return (default: 3)"
          }
        },
        "required": ["search_term"]
      }
    },
    "required": ["query"]
  },
  "description": "Search the web for real-time information about any topic"
}
```

### Location-Aware Web Search

```json
{
  "name": "location_aware_search",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Web search query parameters with location context",
        "properties": {
          "search_term": {
            "type": "string",
            "description": "The search term to look up on the web"
          },
          "location": {
            "type": "string",
            "description": "Geographic location to focus search results (e.g., 'New York, USA')"
          }
        },
        "required": ["search_term", "location"]
      }
    },
    "required": ["query"]
  },
  "description": "Search the web with geographic context to provide location-relevant results"
}
```

### Citation Search

```json
{
  "name": "citation_search",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Academic search query parameters",
        "properties": {
          "topic": {
            "type": "string",
            "description": "The academic topic to search for"
          },
          "year_range": {
            "type": "string",
            "description": "Publication year range (e.g., '2020-2024')"
          }
        },
        "required": ["topic"]
      }
    },
    "required": ["query"]
  },
  "description": "Search for academic citations and research papers on a given topic"
}
```

### News Search Extension

```json
{
  "name": "news_search",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "News search query parameters",
        "properties": {
          "topic": {
            "type": "string",
            "description": "The news topic to search for"
          },
          "timeframe": {
            "type": "string",
            "description": "Time period for news (e.g., 'today', 'this week', 'this month')",
            "enum": ["today", "this week", "this month", "this year"]
          },
          "language": {
            "type": "string",
            "description": "Language preference for news results"
          }
        },
        "required": ["topic"]
      }
    },
    "required": ["query"]
  },
  "description": "Search for recent news articles on a specific topic"
}
```

### Technical Documentation Search

```json
{
  "name": "technical_docs_search",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Technical documentation search parameters",
        "properties": {
          "technology": {
            "type": "string",
            "description": "Technology or framework name (e.g., 'React', 'Python', 'Kubernetes')"
          },
          "specific_term": {
            "type": "string",
            "description": "Specific method, function, or concept to search for"
          },
          "version": {
            "type": "string",
            "description": "Version of the technology (optional)"
          }
        },
        "required": ["technology", "specific_term"]
      }
    },
    "required": ["query"]
  },
  "description": "Search for technical documentation, API references, and developer guides"
}
```

### Product Review Search

```json
{
  "name": "product_review_search",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Product review search parameters",
        "properties": {
          "product_name": {
            "type": "string",
            "description": "Name of the product to find reviews for"
          },
          "review_type": {
            "type": "string",
            "description": "Type of reviews to focus on",
            "enum": ["professional", "user", "all"]
          },
          "min_rating": {
            "type": "number",
            "description": "Minimum rating threshold (1-5)"
          }
        },
        "required": ["product_name"]
      }
    },
    "required": ["query"]
  },
  "description": "Search for product reviews and ratings from across the web"
}
```

### Competitive Analysis Search

```json
{
  "name": "competitive_analysis",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Competitive analysis search parameters",
        "properties": {
          "company_name": {
            "type": "string",
            "description": "Primary company to research"
          },
          "competitors": {
            "type": "array",
            "description": "List of competitors to compare against",
            "items": {
              "type": "string"
            }
          },
          "industry": {
            "type": "string",
            "description": "Industry sector for more targeted results"
          }
        },
        "required": ["company_name"]
      }
    },
    "required": ["query"]
  },
  "description": "Research companies and perform competitive analysis with web data"
}
```

## Implementation Notes

To implement these extensions, you'll need to:

1. Create the extension in the Tenant AI Chat interface
2. Set up the appropriate execution steps to call the OpenAI API
3. Include necessary headers (OpenAI API key)

### Sample Execution Steps

Here's an example of execution steps for the basic web search extension:

```javascript
// Parse the incoming function call arguments
const searchTerm = args.query.search_term;
const numResults = args.query.num_results || 3;

// Construct the OpenAI API request
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-4o-search-preview",
    web_search_options: {},
    messages: [
      {
        role: "user",
        content: searchTerm
      }
    ]
  })
});

const data = await response.json();
return data.choices[0].message.content;
```

For the news search extension, you could use:

```javascript
// Parse the incoming function call arguments
const topic = args.query.topic;
const timeframe = args.query.timeframe || "this week";
const language = args.query.language || "English";

// Construct the search query with timeframe
const searchTerm = `${topic} news ${timeframe} ${language !== "English" ? "in " + language : ""}`;

// Construct the OpenAI API request
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-4o-search-preview",
    web_search_options: {},
    messages: [
      {
        role: "user",
        content: searchTerm
      }
    ]
  })
});

const data = await response.json();
return data.choices[0].message.content;
```

### Required Headers

For the extension to work properly, you'll need to include:

| Header Key | Header Value | Description |
|------------|--------------|-------------|
| Content-Type | application/json | Specifies the content type |
| Authorization | Bearer YOUR_OPENAI_API_KEY | Your OpenAI API key |

## Best Practices

1. **Rate Limiting**: Be mindful of OpenAI's rate limits and implement appropriate error handling
2. **Security**: Store API keys securely using the extensions header system
3. **User Experience**: Design your extensions to return concise and relevant information
4. **Attribution**: Always include source URLs in your response to properly attribute information
5. **Caching**: Consider implementing a caching layer for frequently searched topics
6. **Error Handling**: Implement robust error handling for API failures
7. **Query Construction**: Craft search queries carefully to get the most relevant results
8. **Timeout Management**: Add timeout handling for long-running searches
9. **Result Processing**: Consider post-processing results for better formatting and relevance