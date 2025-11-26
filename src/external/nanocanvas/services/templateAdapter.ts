import { Template } from "../types";

export async function fetchNanoCanvasTemplates(): Promise<Template[]> {
  return [
    {
      id: 'text_to_image',
      name: 'Text to Image',
      description: 'Generate an image from a text prompt',
      promptTemplate: 'A high-quality image of ${subject}',
      type: 'create',
      icon: 'image',
      requiresImage: false,
      category: 'basic'
    },
    {
      id: 'single_image_edit',
      name: 'Single Image Edit',
      description: 'Edit a single image using a prompt',
      promptTemplate: 'Enhance this object: ${instruction}',
      type: 'edit',
      icon: 'edit',
      requiresImage: true,
      category: 'basic'
    },
    {
      id: 'video_motion',
      name: 'Video Motion',
      description: 'Generate motion video from a text prompt',
      promptTemplate: 'Create a smooth motion video about ${subject}',
      type: 'video',
      icon: 'video',
      requiresImage: false,
      category: 'video'
    },
  ];
}
