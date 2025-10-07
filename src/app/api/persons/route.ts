import { NextResponse } from "next/server";
import mockPersons from "./persons.json"


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const results = mockPersons.filter((item) =>
    item.toLowerCase().includes(q)
  );

  // emulating delay
  await new Promise((res) => setTimeout(res, 500));

  return NextResponse.json(results);
}
