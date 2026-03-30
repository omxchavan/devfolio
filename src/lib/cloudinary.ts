import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function generateSignedUploadParams() {
  const timestamp = Math.round(Date.now() / 1000);

  const params = {
    timestamp,
    folder: "devfolio",
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    ...params,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}

/**
 * Optimizes a Cloudinary image URL by adding auto-format and auto-quality parameters.
 * E.g., .../upload/v123/... -> .../upload/q_auto,f_auto/v123/...
 */
export function getOptimizedUrl(url: string) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/q_auto,f_auto/");
}

export default cloudinary;
