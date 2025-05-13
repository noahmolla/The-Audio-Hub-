import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // This function is called before generating the token
        // Here you can validate the user is authenticated
        // and authorized to upload the file

        return {
          allowedContentTypes: ["audio/mpeg", "audio/wav", "audio/ogg"],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // you could pass a user id from auth
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // This won't work on localhost, but will work in production
        console.log("Audio upload completed", blob)

        try {
          // Run any logic after the file upload completed
          // For example, you could store the URL in a database
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ audioUrl: blob.url, userId });
        } catch (error) {
          throw new Error("Could not update user")
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
