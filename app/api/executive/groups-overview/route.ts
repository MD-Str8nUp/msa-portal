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

    // Fetch all groups with member counts
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            scouts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data for frontend
    const groupData = groups.map(group => ({
      id: group.id,
      name: group.name,
      memberCount: group._count.scouts,
      // Using description as location for now, or default locations
      location: group.description || getDefaultLocation(group.name)
    }));

    return NextResponse.json(groupData);
  } catch (error) {
    console.error("Groups overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups overview" },
      { status: 500 }
    );
  }
}

// Helper function to provide default locations based on group names
function getDefaultLocation(groupName: string): string {
  const locations: { [key: string]: string } = {
    "A": "Main Hall - MSA Center",
    "B": "Youth Wing - MSA Center",
    "C": "Junior Room - MSA Center",
    "Eagle Scouts": "Community Center A",
    "Wolf Pack": "Library Hall",
    "Trailblazers": "School Gymnasium"
  };
  
  return locations[groupName] || "MSA Community Center";
}