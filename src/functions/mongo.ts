import { Schema, connect, model } from 'mongoose';
import { Tag as TagType } from '../types/main';
import { mongoURL } from '../../config.json';

export const connectDB = () => {
  connect(mongoURL).then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  });
};

const tagSchema = new Schema({
  content: String,
  status: String,
  name: String,
  id: String
});

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
    new TagModel({
      content: this.content,
      status: this.status,
      name: this.name,
      id: this.id
    }).save();
  }
}

export const modifyTag = async (name: string, tag: TagType) => {
  try {
    const modifiedTag = await TagModel.findOneAndUpdate({ name: name }, tag);
    if (modifiedTag) {
      return { success: true, info: 'Tag modified successfully' };
    }
    return { success: false, info: 'Tag not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
};

export const deleteTag = async (name: string) => {
  try {
    const tag = await TagModel.deleteOne({ name: name });
    if (tag) {
      return { success: true, info: 'Tag deleted successfully' };
    }
    return { success: false, info: 'Tag not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
};

export const getTag = async (name: string) => {
  try {
    const tag = await TagModel.findOne({ name: name });
    if (tag) {
      return { success: true, info: 'Tag found', tag: tag };
    }
    return { success: false, info: 'Tag not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
};

export const getTagNames = async () => {
  try {
    const tags = await TagModel.find();
    if (tags) {
      const names: string[] = [];
      tags
        .filter((tag) => 'approved' === tag.status)
        .forEach((tag) => {
          return names.push(tag.name as string);
        });
      return { success: true, info: 'Tags found', names: names };
    }
    return { success: false, info: 'Tags not found' };
  } catch (error) {
    return { success: false, info: 'An error occurred', error: error };
  }
};
