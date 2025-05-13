"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Upload, Headphones, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us - The Audio Hub"
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#4BC4E2_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,#4BC4E2_0%,transparent_50%)]"></div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-[#4BC4E2] flex items-center justify-center">
              <Music className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center text-white">
            About The Audio Hub
          </h1>
          <p className="text-lg md:text-xl text-center max-w-2xl mx-auto text-slate-300">
            A platform created by CompE students to revolutionize how you store, manage, and play your audio files.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-12">
        {/* Our Story */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="h-0.5 w-12 bg-[#4BC4E2] mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Our Story</h2>
            <div className="h-0.5 w-12 bg-[#4BC4E2] ml-4"></div>
          </div>

          <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-slate-800">
            <CardContent className="p-6 md:p-8">
              <p className="text-base md:text-lg text-left text-slate-700 dark:text-slate-300 leading-relaxed">
                We are a passionate group of Computer Engineering students who identified a common challenge: the need
                for a seamless way to access and play audio files across devices.
              </p>
              <p className="text-base md:text-lg text-left text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                Our solution is The Audio Hub - a platform that allows users to either play audio stored locally on
                their devices or upload files to our database for access anywhere, anytime. We've combined our technical
                expertise and love for music to create a user-friendly experience that simplifies audio management.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="h-0.5 w-12 bg-[#4BC4E2] mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">What We Offer</h2>
            <div className="h-0.5 w-12 bg-[#4BC4E2] ml-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#4BC4E2] flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Easy Uploads</h3>
                <p className="text-sm text-left md:text-center text-slate-600 dark:text-slate-400">
                  Upload audio files and file paths to our database through our intuitive Upload File Path page.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#4BC4E2] flex items-center justify-center mb-4">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Direct Listening</h3>
                <p className="text-sm text-left md:text-center text-slate-600 dark:text-slate-400">
                  Listen to audio files directly from your hard drive using our streamlined Listening Page.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#4BC4E2] flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Personal Dashboard</h3>
                <p className="text-sm text-left md:text-center text-slate-600 dark:text-slate-400">
                  Access your uploaded content in your personalized Dashboard and play it directly from the web.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
