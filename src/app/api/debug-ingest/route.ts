import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

/** Local-only debug ingest so phone testing via LAN IP still reaches the workspace log. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const line = `${JSON.stringify({ ...body, timestamp: body.timestamp ?? Date.now() })}\n`;
    const file = path.join(process.cwd(), "debug-d5fe36.log");
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, line, "utf8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
