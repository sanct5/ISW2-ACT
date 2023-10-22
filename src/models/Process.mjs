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
    imageUrl: {
      type: String,
      required: true,
    },
    message: String,
  },
  { _id: true },
);

const ImageSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  filters: [FilterSchema],
});

const ProcessSchema = new Schema({
  filters: [{
    type: String,
    enum: TYPE_OF_FILTERS,
    required: true,
  }],
  images: [ImageSchema],
}, { timestamps: true });

const ProcessModel = model('Process', ProcessSchema);

export default ProcessModel;
