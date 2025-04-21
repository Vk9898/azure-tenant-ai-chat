import {
  GetImageFromStore,
  GetThreadAndImageFromUrl,
} from "./chat-image-service";

export const ImageAPIEntry = async (request: Request): Promise<Response> => {
  const urlPath = request.url;

  const response = await GetThreadAndImageFromUrl(urlPath); // Added await here

  if (response.status !== "OK") {
    return new Response(response.errors[0].message, { status: 404 });
  }

  const { threadId, imgName } = response.response;
  const imageData = await GetImageFromStore(threadId, imgName);

  if (imageData.status === "OK") {
    // Ensure imageData.response is a ReadableStream before creating Response
    if (imageData.response instanceof ReadableStream) {
       return new Response(imageData.response, {
         headers: { "content-type": "image/png" },
       });
    } else {
       // Handle cases where response might not be a stream (e.g., error or unexpected format)
       console.error("GetImageFromStore did not return a ReadableStream.");
       return new Response("Error retrieving image data.", { status: 500 });
    }
  } else {
    return new Response(imageData.errors[0].message, { status: 404 });
  }
};