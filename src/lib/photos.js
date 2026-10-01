export async function preparePhotos(files) {
  const list = Array.from(files);
  if (list.length > 4) throw new Error('Please choose up to four photos.');
  return Promise.all(list.map(file => new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return reject(new Error('Choose JPG, PNG or WebP photos.'));
    if (file.size > 8 * 1024 * 1024) return reject(new Error('Each photo must be smaller than 8 MB.'));
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve({ name: file.name, data: canvas.toDataURL('image/jpeg', .7) });
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('One of your photos could not be read.')); };
    image.src = url;
  })));
}
