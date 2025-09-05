# AI Image Editor - Next.js Version

A modern AI-powered image editor built with Next.js, React, and Google's Vertex AI Gemini 2.5 Flash Image Preview model.

## Features

- 🎨 **Text-to-Image Generation**: Generate high-quality images from text descriptions
- ✨ **Intelligent Image Editing**: Edit images using natural language instructions
- 🖼️ **Canvas-based Editor**: Interactive canvas powered by Fabric.js
- 💬 **AI Chat Interface**: Communicate with AI for image operations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **Modern Stack**: Built with Next.js 15, React 19, and TypeScript

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Canvas**: Fabric.js for image manipulation
- **AI**: Google Vertex AI Gemini 2.5 Flash Image Preview
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- Google Cloud Project with Vertex AI enabled
- Service Account with Vertex AI permissions

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-image-editor-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file:
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_SERVICE_ACCOUNT_KEY=your-service-account-key-json
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Google Cloud Setup

1. Create a Google Cloud Project
2. Enable the Vertex AI API
3. Create a Service Account with Vertex AI permissions
4. Download the service account key JSON
5. Set the JSON content as the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable

### Environment Variables

- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud Project ID
- `GOOGLE_CLOUD_LOCATION`: Region for Vertex AI (default: global)
- `GOOGLE_SERVICE_ACCOUNT_KEY`: Service account key JSON string
- `JWT_SECRET`: Secret for JWT tokens (optional)
- `REPLICATE_API_TOKEN`: Replicate API token (optional)

## Usage

1. **Upload an Image**: Click the "Upload" button to load an image onto the canvas
2. **Generate Images**: Enter a text description and click "Generate" to create new images
3. **Edit Images**: Upload an image, enter editing instructions, and click "Edit"
4. **AI Chat**: Toggle the AI chat panel to see conversation history
5. **Download**: Save your edited images using the "Download" button

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/ai/image/generate` - Generate images from text
- `POST /api/ai/image/edit` - Edit images with instructions
- `POST /api/ai/image/analyze` - Analyze image content

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open a GitHub issue or contact the development team.
