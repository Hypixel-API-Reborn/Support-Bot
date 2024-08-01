import { Schema, connect, model } from 'mongoose';
import { mongoURL } from '../../config.json';

export function connectDB(): void {
  connect(mongoURL).then(() => {
    console.log('Connected to MongoDB');
  });
}
export interface TagType {
  content: string;
  status: string;
  name: string;
  id: string;
}

const tagSchema = new Schema({ content: String, status: String, name: String, id: String });
const TagModel = model('Tag', tagSchema);

export class Tag {
  name: string;
  content: string;
  id: string;
  status: string;
  constructor(name: string, content: string, id: string, status: string) {
    this.name = name;
    this.content = content;
    this.id = id;
    this.status = status;
  }
  save() {
    new TagModel({ content: this.content, status: this.status, name: this.name, id: this.id }).save();
  }
}

export interface TagResponse {
  success: boolean;
  info: string;
  tag?: TagType;
  names?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

export async function modifyTag(name: string, tag: TagType): Promise<TagResponse> {
  try {
    const modifiedTag = await TagModel.findOneAndUpdate({ name: name }, tag);
    if (modifiedTag) {
      return { success: true, info: 'Tag modified successfully' };
    }
    return { success: false, info: 'Tag not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
}

export async function deleteTag(name: string): Promise<TagResponse> {
  try {
    const tag = await TagModel.deleteOne({ name: name });
    if (tag) {
      return { success: true, info: 'Tag deleted successfully' };
    }
    return { success: false, info: 'Tag not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
}

export async function getTag(name: string): Promise<TagResponse> {
  try {
    const tag = await TagModel.findOne({ name: name });
    if (tag) {
      return { success: true, info: 'Tag found', tag: tag as TagType };
    }
    return { success: false, info: 'Tag not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
}

export async function getTagNames(): Promise<TagResponse> {
  try {
    const tags = await TagModel.find();
    if (tags) {
      const names: string[] = [];
      tags
        .filter((tag) => 'approved' === tag.status)
        .forEach((tag) => {
          if (!tag.name) return;
          return names.push(tag.name);
        });
      return { success: true, info: 'Tags found', names: names };
    }
    return { success: false, info: 'Tags not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
}
