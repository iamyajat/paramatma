"use server";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Work, DailyStat, type WorkDoc } from "@/models";

type CounterField = "viewCount" | "shareCount";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

async function record(workId: string, field: CounterField): Promise<number> {
  if (!Types.ObjectId.isValid(workId)) return 0;

  await connectToDatabase();

  const [workResult, dailyResult] = await Promise.allSettled([
    Work.findByIdAndUpdate(workId, { $inc: { [field]: 1 } }, { returnDocument: "after" }).lean<
      WorkDoc | null
    >(),
    DailyStat.findOneAndUpdate(
      { work: workId, date: todayUTC() },
      { $inc: { [field]: 1 } },
      { upsert: true }
    ),
  ]);

  if (dailyResult.status === "rejected") {
    // Known, rare edge case: two concurrent first-ever upserts for the same
    // {work, date} can race on the unique index. Losing a single day-bucket
    // increment is acceptable here — Work's running total below is the
    // source of truth and is unaffected.
    console.error("DailyStat upsert failed", workId, field, dailyResult.reason);
  }

  if (workResult.status === "rejected") {
    console.error("Work counter update failed", workId, field, workResult.reason);
    return 0;
  }

  return workResult.value?.[field] ?? 0;
}

export async function recordView(workId: string): Promise<number> {
  return record(workId, "viewCount");
}

export async function recordShare(workId: string): Promise<number> {
  return record(workId, "shareCount");
}
