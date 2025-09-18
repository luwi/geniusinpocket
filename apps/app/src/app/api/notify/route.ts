import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const subscriptionSchema = z.object({
  email: z.string().email(),
  source: z.string().default("astro-web")
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  if (!json) {
    return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  }

  const result = subscriptionSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json({ success: false, message: "Invalid email" }, { status: 422 });
  }

  const { email, source } = result.data;

  try {
    const entry = await prisma.waitlistEntry.upsert({
      where: { email },
      update: { source },
      create: { email, source }
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Waitlist subscription error", error);

    return NextResponse.json(
      { success: false, message: "Unable to process subscription" },
      { status: 500 }
    );
  }
}
