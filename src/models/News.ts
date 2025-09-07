import mongoose from 'mongoose';


interface NewsAttrs {
  title: string;
  summary: string;
  date: string;
  link: string;
  imageUrl: string;
}

interface NewsDoc extends mongoose.Document {
  title: string;
  summary: string;
  date: string;
  link: string;
  imageUrl: string;
}

interface NewsModel extends mongoose.Model<NewsDoc> {
  build(attrs: NewsAttrs): NewsDoc;
}

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

newsSchema.statics.build = (attrs: NewsAttrs) => {
  return new News(attrs);
};

const News = mongoose.models.News || mongoose.model<NewsDoc, NewsModel>('News', newsSchema);

export { News };
