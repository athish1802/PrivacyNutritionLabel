# Extension Icons

To create the actual PNG icons for the extension, you can:

1. **Use an online converter**: Convert the `icon.svg` to PNG at different sizes
   - Visit https://cloudconvert.com/svg-to-png
   - Upload icon.svg and convert to:
     - icon16.png (16x16)
     - icon48.png (48x48)
     - icon128.png (128x128)

2. **Use ImageMagick** (if installed):
   ```bash
   convert -background none icon.svg -resize 16x16 icon16.png
   convert -background none icon.svg -resize 48x48 icon48.png
   convert -background none icon.svg -resize 128x128 icon128.png
   ```

3. **Use a design tool** like Figma, Canva, or Photoshop to create custom icons

For now, the extension will work but Chrome will show a warning about missing icons until you add the PNG files.
