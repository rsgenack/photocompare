import { getLogs } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    // Get the query parameter for max lines
    const url = new URL(request.url)
    const maxLines = Number.parseInt(url.searchParams.get("maxLines") || "1000", 10)

    // Get the logs
    const logs = getLogs(maxLines)

    // Return the logs as plain text
    return new Response(logs, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    return new Response(`Error retrieving logs: ${error.message}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}

