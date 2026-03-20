"use client";

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface CardPreviewProps {
  cardData: {
    companyName: string
    brandName: string
    officialEmail: string
    personalEmail: string
    phone: string
    address: string
    designation: string
    areaOfBusiness: string
    template: string
    aspectRatio: string
  }
}

export function CardPreview({ cardData }: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/preview` : ''

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, publicUrl, {
        width: 80,
        margin: 0,
        color: {
          dark: cardData.template === 'minimal-light' ? '#000000' : '#ffffff',
          light: '#ffffff00',
        },
      })
    }
  }, [cardData.template, publicUrl])

  const getTemplateStyles = () => {
    const baseStyles = {
      minHeight: '400px',
      transition: 'all 0.3s ease',
    }

    const aspectStyles = {
      landscape: { aspectRatio: '3/2', minHeight: '320px' },
      square: { aspectRatio: '1/1', minHeight: '400px' },
      portrait: { aspectRatio: '2/3', minHeight: '480px' },
    }

    const templates: Record<string, any> = {
      'minimal-light': {
        ...baseStyles,
        ...aspectStyles[cardData.aspectRatio as keyof typeof aspectStyles],
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        color: '#0f172a',
        fontFamily: 'Inter, sans-serif',
      },
      'corporate-indigo': {
        ...baseStyles,
        ...aspectStyles[cardData.aspectRatio as keyof typeof aspectStyles],
        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      },
      'bold-accent': {
        ...baseStyles,
        ...aspectStyles[cardData.aspectRatio as keyof typeof aspectStyles],
        background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      },
      'monochrome-pro': {
        ...baseStyles,
        ...aspectStyles[cardData.aspectRatio as keyof typeof aspectStyles],
        background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
        color: '#ffffff',
        fontFamily: 'Georgia, serif',
      },
    }

    return templates[cardData.template] || templates['minimal-light']
  }

  return (
    <div
      className="rounded-lg shadow-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700"
      style={getTemplateStyles()}
    >
      <div className="h-full p-8 flex flex-col justify-between">
        {/* Header Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-1">
              {cardData.brandName || cardData.companyName}
            </h2>
            <p className="text-sm opacity-80">{cardData.companyName}</p>
          </div>

          <div className="mb-4">
            <div className="text-xl font-semibold mb-2">{cardData.designation}</div>
            {cardData.areaOfBusiness && (
              <div className="text-sm opacity-70">{cardData.areaOfBusiness}</div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="opacity-90">{cardData.officialEmail}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="opacity-90">{cardData.phone}</span>
          </div>

          {cardData.personalEmail && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="opacity-90">{cardData.personalEmail}</span>
            </div>
          )}

          {cardData.address && (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 opacity-70 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="opacity-90">{cardData.address}</span>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="flex justify-end">
          <canvas ref={canvasRef} className="rounded" />
        </div>
      </div>
    </div>
  )
}