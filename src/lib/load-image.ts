/** Resolves once the image is fully decoded, so its natural size is known. */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.src = src
  await image.decode()
  return image
}
