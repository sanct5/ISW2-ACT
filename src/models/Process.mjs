import { Schema, model } from 'mongoose';
import { TYPE_OF_FILTERS, FILTERS_STATUSES, IN_PROGRESS_STATUS } from '../commons/constans.mjs';

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
      default: IN_PROGRESS_STATUS,
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

const ProcessSchema = new Schema({
  filters: [{
    type: String,
    enum: TYPE_OF_FILTERS,
    required: true,
  }],
  images: {
    type: [ImageSchema],
    required: true,
  },
}, { timestamps: true });

const ProcessModel = model('Process', ProcessSchema);

export default ProcessModel;
