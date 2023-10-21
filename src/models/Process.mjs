import { Schema, model } from 'mongoose';
import { TYPE_OF_FILTERS, FILTERS_STATUSES } from '../commons/constans.mjs';

const FilterSchema = new Schema(
  {
    name: {
      type: String,
      enum: TYPE_OF_FILTERS,
      required: true,
    },
    status: {
      type: String,
      enum: FILTERS_STATUSES,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
  },
  { _id: true },
);

const ImageSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    filters: {
      type: [FilterSchema],
      required: true,
    },
  },
  { _id: true },
);

const ProcessSchema = new Schema(
  {
    filters: {
      type: [{
        type: String,
        enum: TYPE_OF_FILTERS,
        required: true,
      }],
    },
    images: {
      type: [ImageSchema],
      required: true,
    },
  },
  { timestamps: true },
);

const ProcessModel = model('process', ProcessSchema);

export default ProcessModel;
