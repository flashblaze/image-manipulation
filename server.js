const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const fetch = require('isomorphic-unfetch');

const upload = multer();
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const manipulate = fileInfo => {
  const { file, width, height, imageFormat, rotationAngle } = fileInfo;

  return sharp(file.buffer)
    .resize({ height: parseInt(height), width: parseInt(width) })
    .rotate(0 || parseInt(rotationAngle))
    .toFormat(imageFormat)
    .toBuffer()
    .then(data => {
      // imgur requires base64 data
      let base64File = data.toString('base64');

      const config = {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${process.env.CLIENT_ID}`,
        },
        body: base64File,
      };

      return fetch('https://api.imgur.com/3/image', config)
        .then(res => {
          return res.json();
        })
        .catch(err => console.error(err));
    })
    .then(res => {
      return res;
    })
    .catch(err => console.error(err));
};

app.prepare().then(() => {
  const server = express();

  // For parsing application/json
  server.use(bodyParser.json());

  server.post('/api/preview', upload.single('file'), (req, res) => {
    let base64File = req.file.buffer.toString('base64');

    sharp(req.file.buffer)
      .metadata()
      .then(info => {
        res.status(200).send({
          originalHeight: info.height,
          originalWidth: info.width,
          originalFormat: info.format,
          base64File,
        });
      });
  });

  server.post('/api/upload', upload.single('file'), (req, res) => {
    // Process the file only if it of type image
    if (req.file.mimetype.split('/')[0] !== 'image') {
      res.sendStatus(403);
    } else {
      if (!req.body) {
        res.sendStatus(500);
      } else {
        const { width, height, imageFormat, rotationAngle } = req.body;
        manipulate({
          file: req.file,
          width,
          height,
          imageFormat,
          rotationAngle,
        }).then(uploadInfo => {
          if (uploadInfo.data !== null) {
            return res.status(200).json({ uploadInfo: uploadInfo.data });
          } else {
            res.status(404);
          }
        });
      }
    }
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
