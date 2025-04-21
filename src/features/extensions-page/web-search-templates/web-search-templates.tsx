"use client";

import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/features/ui/card";
import { Button } from "@/features/ui/button";
import { Search, MapPin, Book, Newspaper, Code, ShoppingCart } from "lucide-react";
import { extensionStore } from "../extension-store";
import { uniqueId } from "@/features/common/util";

const WEB_SEARCH_TEMPLATE = {
  id: "",
  name: "Web Search",
  description: "Search the web for real-time information about any topic",
  executionSteps: `This extension allows the AI to search the web for current information.`,
  headers: [
    {
      id: uniqueId(),
      key: "Authorization",
      value: "Bearer YOUR_OPENAI_API_KEY"
    },
    {
      id: uniqueId(),
      key: "Content-Type", 
      value: "application/json"
    }
  ],
  functions: [
    {
      id: uniqueId(),
      endpointType: "POST",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isOpen: false,
      code: `
// Parse the incoming function call arguments
const searchTerm = args.query.search_term;
const numResults = args.query.num_results || 3;

// Construct the request body
const requestBody = {
  model: "gpt-4o-search-preview",
  web_search_options: {},
  messages: [
    {
      role: "user",
      content: searchTerm
    }
  ]
};

return JSON.stringify(requestBody);`
    }
  ],
  isPublished: false,
  userId: "",
  createdAt: new Date(),
  type: "EXTENSION"
};

const LOCATION_SEARCH_TEMPLATE = {
  id: "",
  name: "Location-Aware Search",
  description: "Search the web with location context for relevant results",
  executionSteps: `This extension allows the AI to search the web with location awareness.`,
  headers: [
    {
      id: uniqueId(),
      key: "Authorization",
      value: "Bearer YOUR_OPENAI_API_KEY"
    },
    {
      id: uniqueId(),
      key: "Content-Type", 
      value: "application/json"
    }
  ],
  functions: [
    {
      id: uniqueId(),
      endpointType: "POST",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isOpen: false,
      code: `
// Parse the incoming function call arguments
const searchTerm = args.query.search_term;
const location = args.query.location;

// Construct the request body
const requestBody = {
  model: "gpt-4o-search-preview",
  web_search_options: {
    user_location: {
      type: "approximate",
      approximate: {
        country: location.split(",")[1]?.trim() || "",
        city: location.split(",")[0]?.trim() || "",
      }
    }
  },
  messages: [
    {
      role: "user",
      content: searchTerm
    }
  ]
};

return JSON.stringify(requestBody);`
    }
  ],
  isPublished: false,
  userId: "",
  createdAt: new Date(),
  type: "EXTENSION"
};

const CITATION_SEARCH_TEMPLATE = {
  id: "",
  name: "Citation Search",
  description: "Search for academic citations and research papers",
  executionSteps: `This extension allows the AI to search for academic papers and citations.`,
  headers: [
    {
      id: uniqueId(),
      key: "Authorization",
      value: "Bearer YOUR_OPENAI_API_KEY"
    },
    {
      id: uniqueId(),
      key: "Content-Type", 
      value: "application/json"
    }
  ],
  functions: [
    {
      id: uniqueId(),
      endpointType: "POST",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isOpen: false,
      code: `
// Parse the incoming function call arguments
const topic = args.query.topic;
const yearRange = args.query.year_range || "";

// Construct the search term with year range if provided
const searchTerm = yearRange 
  ? topic + " academic papers published " + yearRange
  : topic + " recent academic papers";

// Construct the request body
const requestBody = {
  model: "gpt-4o-search-preview",
  web_search_options: {},
  messages: [
    {
      role: "user",
      content: searchTerm
    }
  ]
};

return JSON.stringify(requestBody);`
    }
  ],
  isPublished: false,
  userId: "",
  createdAt: new Date(),
  type: "EXTENSION"
};

const NEWS_SEARCH_TEMPLATE = {
  id: "",
  name: "News Search",
  description: "Search for recent news articles on specific topics",
  executionSteps: `This extension allows the AI to search for the latest news on any topic.`,
  headers: [
    {
      id: uniqueId(),
      key: "Authorization",
      value: "Bearer YOUR_OPENAI_API_KEY"
    },
    {
      id: uniqueId(),
      key: "Content-Type", 
      value: "application/json"
    }
  ],
  functions: [
    {
      id: uniqueId(),
      endpointType: "POST",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isOpen: false,
      code: `
// Parse the incoming function call arguments
const topic = args.query.topic;
const timeframe = args.query.timeframe || "this week";
const language = args.query.language || "English";

// Construct the search query with timeframe
const searchTerm = topic + " news " + timeframe + (language !== "English" ? " in " + language : "");

// Construct the request body
const requestBody = {
  model: "gpt-4o-search-preview",
  web_search_options: {},
  messages: [
    {
      role: "user",
      content: searchTerm
    }
  ]
};

return JSON.stringify(requestBody);`
    }
  ],
  isPublished: false,
  userId: "",
  createdAt: new Date(),
  type: "EXTENSION"
};

const TECH_DOCS_SEARCH_TEMPLATE = {
  id: "",
  name: "Technical Docs Search",
  description: "Search for technical documentation and developer guides",
  executionSteps: `This extension allows the AI to search for technical documentation, API references, and developer guides.`,
  headers: [
    {
      id: uniqueId(),
      key: "Authorization",
      value: "Bearer YOUR_OPENAI_API_KEY"
    },
    {
      id: uniqueId(),
      key: "Content-Type", 
      value: "application/json"
    }
  ],
  functions: [
    {
      id: uniqueId(),
      endpointType: "POST",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isOpen: false,
      code: `
// Parse the incoming function call arguments
const technology = args.query.technology;
const specificTerm = args.query.specific_term;
const version = args.query.version || "";

// Construct the search query
const searchTerm = technology + " " + specificTerm + (version ? " " + version : "") + " documentation guide reference";

// Construct the request body
const requestBody = {
  model: "gpt-4o-search-preview",
  web_search_options: {},
  messages: [
    {
      role: "user",
      content: searchTerm
    }
  ]
};

return JSON.stringify(requestBody);`
    }
  ],
  isPublished: false,
  userId: "",
  createdAt: new Date(),
  type: "EXTENSION"
};

const PRODUCT_REVIEW_TEMPLATE = {
  id: "",
  name: "Product Review Search",
  description: "Search for product reviews and ratings from across the web",
  executionSteps: `This extension allows the AI to search for product reviews and compare ratings from different sources.`,
  headers: [
    {
      id: uniqueId(),
      key: "Authorization",
      value: "Bearer YOUR_OPENAI_API_KEY"
    },
    {
      id: uniqueId(),
      key: "Content-Type", 
      value: "application/json"
    }
  ],
  functions: [
    {
      id: uniqueId(),
      endpointType: "POST",
      endpoint: "https://api.openai.com/v1/chat/completions",
      isOpen: false,
      code: `
// Parse the incoming function call arguments
const productName = args.query.product_name;
const reviewType = args.query.review_type || "all";
const minRating = args.query.min_rating || "";

// Construct the search query
let searchTerm = productName + " reviews";
if (reviewType !== "all") {
  searchTerm += " " + reviewType;
}
if (minRating) {
  searchTerm += " rated above " + minRating + " stars";
}

// Construct the request body
const requestBody = {
  model: "gpt-4o-search-preview",
  web_search_options: {},
  messages: [
    {
      role: "user",
      content: searchTerm
    }
  ]
};

return JSON.stringify(requestBody);`
    }
  ],
  isPublished: false,
  userId: "",
  createdAt: new Date(),
  type: "EXTENSION"
};

export const WebSearchTemplates: FC = () => {
  const createExtensionFromTemplate = (template: any) => {
    extensionStore.updateExtension({
      ...template,
      id: uniqueId()
    });
    extensionStore.updateOpened(true);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Web Search Templates</h2>
      <p className="text-muted-foreground mb-6">
        Quickly create extensions that leverage OpenAI's web search capabilities. 
        You'll need an OpenAI API key to use these templates.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Web Search
            </CardTitle>
            <CardDescription>Search the web for real-time information</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Enables searching the web for current information on any topic.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => createExtensionFromTemplate(WEB_SEARCH_TEMPLATE)}
              variant="outline" 
              className="w-full"
            >
              Use This Template
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location-Aware Search
            </CardTitle>
            <CardDescription>Search with geographic context</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Provides location-specific search results based on geographic context.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => createExtensionFromTemplate(LOCATION_SEARCH_TEMPLATE)}
              variant="outline" 
              className="w-full"
            >
              Use This Template
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Citation Search
            </CardTitle>
            <CardDescription>Search for academic citations</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Find academic papers and research citations on specific topics.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => createExtensionFromTemplate(CITATION_SEARCH_TEMPLATE)}
              variant="outline" 
              className="w-full"
            >
              Use This Template
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              News Search
            </CardTitle>
            <CardDescription>Search for recent news articles</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Find the latest news on specific topics with customizable timeframes.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => createExtensionFromTemplate(NEWS_SEARCH_TEMPLATE)}
              variant="outline" 
              className="w-full"
            >
              Use This Template
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Technical Docs Search
            </CardTitle>
            <CardDescription>Search for developer documentation</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Find technical documentation, API references, and developer guides.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => createExtensionFromTemplate(TECH_DOCS_SEARCH_TEMPLATE)}
              variant="outline" 
              className="w-full"
            >
              Use This Template
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Product Review Search
            </CardTitle>
            <CardDescription>Search for product reviews</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Find and compare product reviews and ratings from across the web.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => createExtensionFromTemplate(PRODUCT_REVIEW_TEMPLATE)}
              variant="outline" 
              className="w-full"
            >
              Use This Template
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}; 