const ImageKit = require('imagekit');

let imagekit = null;

function getImageKit() {
  if (!imagekit && process.env.IMAGEKIT_PUBLIC_KEY) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || process.env.CLOUDFRONT_URL,
    });
  }
  return imagekit;
}

async function uploadToImageKit(file, folder = 'silapor') {
  const ik = getImageKit();
  if (!ik) {
    return null;
  }

  const result = await ik.upload({
    file: file.buffer,
    fileName: `${Date.now()}-${file.originalname}`,
    folder: `/${folder}`,
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    fileId: result.fileId,
    thumbnailUrl: result.thumbnailUrl,
  };
}

function getCdnUrl(path, transformations = []) {
  const ik = getImageKit();
  if (!ik) return path;
  return ik.url({ path, transformation: transformations });
}

module.exports = { uploadToImageKit, getCdnUrl, getImageKit };
