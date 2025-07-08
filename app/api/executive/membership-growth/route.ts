import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify executive role
    if (authResult.user.role !== "executive" && !authResult.user.isExecutive) {
      return NextResponse.json({ error: "Forbidden - Executive access required" }, { status: 403 });
    }

    // Get the last 6 months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch scouts grouped by month
    const scouts = await prisma.scout.findMany({
      where: {
        joinedDate: {
          gte: sixMonthsAgo
        }
      },
      select: {
        joinedDate: true
      },
      orderBy: {
        joinedDate: 'asc'
      }
    });

    // Get total count for each month
    const monthlyData = new Map<string, number>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize current and past 5 months
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const monthKey = months[date.getMonth()];
      monthlyData.set(monthKey, 0);
    }

    // Count cumulative scouts up to each month
    let cumulativeCount = await prisma.scout.count({
      where: {
        joinedDate: {
          lt: sixMonthsAgo
        }
      }
    });

    // Process scouts data
    scouts.forEach(scout => {
      const month = months[scout.joinedDate.getMonth()];
      const current = monthlyData.get(month) || 0;
      monthlyData.set(month, current + 1);
    });

    // Convert to cumulative counts
    const membershipData: Array<{ month: string; count: number }> = [];
    monthlyData.forEach((count, month) => {
      cumulativeCount += count;
      membershipData.push({ month, count: cumulativeCount });
    });

    return NextResponse.json(membershipData);
  } catch (error) {
    console.error("Membership growth error:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership growth data" },
      { status: 500 }
    );
  }
}