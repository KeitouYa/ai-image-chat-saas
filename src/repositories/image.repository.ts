import Image from "@/src/models/image.model";

export const imageRepository = {

  // Create Image in DB
  async createImage(data: any) {
    const image = await new Image(data).save();
    return JSON.parse(JSON.stringify(image));
  },


  // Find User Images in DB
  async findUserImages(userEmail: string, page: number, limit: number) {
    const [images, count] = await Promise.all([
      Image.find({ userEmail })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      Image.countDocuments({ userEmail }),
    ]);

    return {
      images: JSON.parse(JSON.stringify(images)),
      totalCount: count,
    };
  },


  // Find Image by ID in DB
  async findImageById(id: string) {
    const image = await Image.findById(id);
    return JSON.parse(JSON.stringify(image));
  },
};
