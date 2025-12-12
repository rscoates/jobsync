import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const GET = async (
  req: NextRequest,
  { params }: { params: { path: string[] } }
) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      ...params.path
    );

    // Security: prevent path traversal
    const normalizedPath = path.normalize(filePath);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    
    if (!normalizedPath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 403 }
      );
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const stat = fs.statSync(normalizedPath);
    if (!stat.isFile()) {
      return NextResponse.json(
        { error: "Not a file" },
        { status: 400 }
      );
    }

    const fileBuffer = fs.readFileSync(normalizedPath);
    const ext = path.extname(normalizedPath).toLowerCase();

    // Set appropriate content type
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
};
