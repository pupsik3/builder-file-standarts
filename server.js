import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./app/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const target = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!target.startsWith(resolve(root) + sep) || !(await stat(target)).isFile()) {
      response.writeHead(404).end();
      return;
    }
    const extension = extname(target);
    const contentType = types[extension] ?? 'application/octet-stream';
    if (extension === '.mp4' || extension === '.mp3') {
      const { size } = await stat(target);
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]);
        const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1);
        if (start >= size || end < start) {
          response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
          return;
        }
        response.writeHead(206, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
        createReadStream(target, { start, end }).pipe(response);
        return;
      }
      response.writeHead(200, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Length': size });
    } else response.writeHead(200, { 'Content-Type': contentType });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
}).listen(Number(process.env.PORT ?? 4182), '127.0.0.1', function () {
  console.log(`http://127.0.0.1:${this.address().port}/`);
});
