import { createUploadthing, type FileRouter } from 'uploadthing/express';
import { Request } from 'express';
import { JwtPayload } from '@food-delivery/types';

type AuthenticatedRequest = Request & { user: JwtPayload };

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  restaurantImage: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(({ req }) => {
      const authReq = req as AuthenticatedRequest;

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
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(({ req }) => {
      const authReq = req as AuthenticatedRequest;

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
