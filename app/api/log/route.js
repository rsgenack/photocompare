import { logToFile } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function POST(request) {
  try {
    const { message, level = "info" } = await request.json()

    // Log the message to the file
    logToFile(message, level)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error logging message:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

