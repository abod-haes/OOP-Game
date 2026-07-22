import { NextResponse } from "next/server";
import { LOCAL_SECTIONS } from "@/data/data";

export async function GET() {
  return NextResponse.json({
    data: LOCAL_SECTIONS,
    totalCount: LOCAL_SECTIONS.length,
    pageSize: LOCAL_SECTIONS.length,
    pageNumber: 1,
    totalPages: 1,
    nextPage: null,
    previousPage: null,
  });
}
