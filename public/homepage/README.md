# Homepage Media Files

This folder contains large media files (images and video) used in the homepage carousel.

## Why are these files not in the repository?

These files are **not tracked by Git** because:
- The video file exceeds GitHub's 100MB file size limit
- Large image files increase repository size unnecessarily
- These files should be stored on a CDN or cloud storage in production

## Setup for Local Development

1. Copy all homepage images and the video to this folder:
   - Images: `*.jpg`, `*.png`, `*.gif`, `*.jpeg`
   - Video: `ISAAC INSTITUTE OF TECHNOLOGY (2).mp4`

2. The files should be placed directly in `public/homepage/`

## Production Deployment

For production, consider these alternatives:

### Option 1: Cloud Storage (Recommended)
Upload media files to:
- **AWS S3** (already configured in your project)
- **Cloudinary**
- **Vercel Blob Storage**

Then update the paths in `src/pages/Home.tsx`

### Option 2: Video Streaming
For the large video file, use:
- **YouTube** (embed the video)
- **Vimeo**
- **AWS CloudFront** with S3

### Option 3: Optimize Files
- Compress the video to reduce file size below 100MB
- Optimize images using tools like:
  - TinyPNG
  - ImageOptim
  - Sharp (Node.js)

## File List

Expected files in this folder:
- `ISAAC INSTITUTE OF TECHNOLOGY (2).mp4` (162MB video)
- 49 image files (`.jpg`, `.png`, `.jpeg`)

## Note

**DO NOT** commit these files to Git. They are in `.gitignore` for a reason!

