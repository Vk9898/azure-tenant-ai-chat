import {
  GetImageFromStore,
  GetThreadAndImageFromUrl,
} from "./chat-image-service";

export const ImageAPIEntry = async (request: Request): Promise<Response> => {
  const urlPath = request.url;

  // Await the promise to resolve before accessing properties
  const response = await GetThreadAndImageFromUrl(urlPath);

  // Now 'response' holds the actual ServerActionResponse object
  if (response.status !== "OK") {
    // Ensure error message exists before accessing
    const errorMessage = response.errors?.[0]?.message || "Unknown error fetching thread/image info";
    return new Response(errorMessage, { status: 404 });
  }

  const { threadId, imgName } = response.response;
  const imageData = await GetImageFromStore(threadId, imgName);

  if (imageData.status === "OK") {
    // Ensure response exists before accessing
    const imageStream = imageData.response;
    if (!imageStream) {
       return new Response("Image data stream is missing", { status: 500 });
    }
    return new Response(imageStream, {
      headers: { "content-type": "image/png" },
    });
  } else {
    // Ensure error message exists before accessing
    const errorMessage = imageData.errors?.[0]?.message || "Unknown error fetching image data";
    return new Response(errorMessage, { status: 404 });
  }
};