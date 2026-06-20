import { createUploadthing, type FileRouter } from 'uploadthing/express';
import { AuthRequest } from 'src/auth/utils/authRequest.utils';

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  restaurantImage: f({
    image: {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
  })
    .middleware(({ req }) => {
      const authReq = req as AuthRequest;

      return { uploadedBy: authReq?.user?.sub ?? 'unknown' };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload completed by:', metadata.uploadedBy);
      console.log('File URL:', file.ufsUrl);

      return {
        url: file.ufsUrl,
      };
    }),

  menuItemImage: f({
    image: {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
  })
    .middleware(({ req }) => {
      const authReq = req as AuthRequest;

      return { uploadedBy: authReq?.user?.sub ?? 'unknown' };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload completed by:', metadata.uploadedBy);
      console.log('File URL:', file.ufsUrl);

      return {
        url: file.ufsUrl,
      };
    }),
};

export type OurFileRouter = typeof uploadRouter;
