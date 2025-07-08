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

    // Fetch recent reports from the database
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        date: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 5 // Get the 5 most recent reports
    });

    // Transform data for frontend
    const recentReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      date: formatDate(report.date),
      type: capitalizeType(report.type)
    }));

    // If no reports exist, return sample data to indicate what types of reports are available
    if (recentReports.length === 0) {
      return NextResponse.json([
        {
          id: "sample-1",
          title: "Monthly Attendance Report",
          date: formatDate(new Date()),
          type: "Attendance"
        },
        {
          id: "sample-2",
          title: "Achievement Progress Report",
          date: formatDate(new Date()),
          type: "Achievements"
        },
        {
          id: "sample-3",
          title: "Financial Summary",
          date: formatDate(new Date()),
          type: "Financial"
        }
      ]);
    }

    return NextResponse.json(recentReports);
  } catch (error) {
    console.error("Recent reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent reports" },
      { status: 500 }
    );
  }
}

// Helper function to format date
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('en-AU', options);
}

// Helper function to capitalize report type
function capitalizeType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'attendance': 'Attendance',
    'achievement': 'Achievements',
    'financial': 'Financial',
    'incident': 'Incident',
    'progress': 'Progress'
  };
  
  return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
}