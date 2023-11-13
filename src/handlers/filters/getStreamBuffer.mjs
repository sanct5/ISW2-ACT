async function getStreamBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (chunk) => chunks.push(chunk));
    readableStream.on('error', reject);
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export default getStreamBuffer;
