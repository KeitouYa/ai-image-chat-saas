export interface ImageType {
  _id: string;
  userEmail: string;
  userName: string;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number; // Mongoose version key
}
