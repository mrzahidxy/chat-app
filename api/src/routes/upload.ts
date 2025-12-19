import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import multer, { type FileFilterCallback, MulterError } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import rateLimit from "express-rate-limit";
import { cloudinary } from "../config/cloudinary";
import auth from "../middleware/auth";

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many uploads. Please try again later." },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "kotha/uploads",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ quality: "auto:eco" }],
  }),
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const isImage = /^image\/(jpe?g|png|gif|webp)$/i.test(file.mimetype);
  if (!isImage) {
    return cb(new Error("Only image uploads are allowed."));
  }
  cb(null, true);
};

const upload = multer({
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

type AuthedRequest<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown
> = Request<P, ResBody, ReqBody> & { userId?: string };

router.post(
  "/",
  auth,
  uploadLimiter,
  upload.single("image"),
  async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.file || !("path" in req.file)) {
        return res.status(400).json({ message: "No image uploaded." });
      }

      const payload = {
        url: req.file.path,
        publicId: req.file.filename,
        format: (req.file as unknown as { format?: string }).format,
        bytes: (req.file as unknown as { bytes?: number }).bytes,
      };

      console.log(
        `[upload] user=${req.userId} uploaded publicId=${payload.publicId} bytes=${payload.bytes}`
      );

      return res.status(201).json({ image: payload });
    } catch (error) {
      console.error("[upload] failed", error);
      return res
        .status(500)
        .json({ message: "Failed to upload image. Please try again." });
    }
  }
);

router.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ message: "File too large. Max size is 5MB." });
      }
      return res.status(400).json({ message: err.message });
    }

    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }

    return next(err);
  }
);

export default router;
