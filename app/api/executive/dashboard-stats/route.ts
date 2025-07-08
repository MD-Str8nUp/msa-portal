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

    // Fetch dashboard statistics
    const [totalGroups, totalLeaders, totalScouts, upcomingEvents] = await Promise.all([
      // Count total groups
      prisma.group.count(),
      
      // Count total leaders (users who are leaders or have leader groups)
      prisma.user.count({
        where: {
          OR: [
            { isLeader: true },
            { role: "leader" },
            { leaderGroups: { some: {} } }
          ]
        }
      }),
      
      // Count total scouts/members
      prisma.scout.count(),
      
      // Count upcoming events (events with start date in the future)
      prisma.event.count({
        where: {
          startDate: {
            gte: new Date()
          }
        }
      })
    ]);

    // Calculate total members (scouts + their parents)
    const totalParents = await prisma.user.count({
      where: {
        OR: [
          { isParent: true },
          { role: "parent" },
          { scouts: { some: {} } }
        ]
      }
    });

    const totalMembers = totalScouts + totalParents;

    return NextResponse.json({
      totalGroups,
      totalLeaders,
      totalMembers,
      upcomingEvents
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}