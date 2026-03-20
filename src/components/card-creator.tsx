"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { CardPreview } from "@/components/card-preview"

interface FormData {
  gstin: string
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

export function CardCreator() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    gstin: "",
    companyName: "",
    brandName: "",
    officialEmail: "",
    personalEmail: "",
    phone: "",
    address: "",
    designation: "",
    areaOfBusiness: "",
    template: "minimal-light",
    aspectRatio: "landscape",
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    // GSTIN validation (India format: 2 characters + 10 digits + 1 character + 1 alphanumeric + 1 character)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (!gstinRegex.test(formData.gstin)) {
      toast.error("Invalid GSTIN format")
      return false
    }

    // Phone validation (E.164 format for India)
    const phoneRegex = /^\+91[6-9]\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Invalid phone number. Use format: +91XXXXXXXXXX")
      return false
    }

    if (!formData.companyName || !formData.officialEmail || !formData.designation) {
      toast.error("Please fill in all required fields")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create card")
      }

      toast.success("Card created successfully!")
      router.push(`/cards/${data.id}/edit`)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Card Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN *</Label>
                <Input
                  id="gstin"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company Ltd"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name (Optional)</Label>
              <Input
                id="brandName"
                placeholder="Brand or Trade Name"
                value={formData.brandName}
                onChange={(e) => handleChange("brandName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officialEmail">Official Email *</Label>
                <Input
                  id="officialEmail"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.officialEmail}
                  onChange={(e) => handleChange("officialEmail", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Personal Email</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.personalEmail}
                  onChange={(e) => handleChange("personalEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91XXXXXXXXXX"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use E.164 format: +91 followed by 10 digits
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full business address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  placeholder="CEO, Manager, etc."
                  value={formData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaOfBusiness">Area of Business</Label>
                <Input
                  id="areaOfBusiness"
                  placeholder="IT, Manufacturing, etc."
                  value={formData.areaOfBusiness}
                  onChange={(e) => handleChange("areaOfBusiness", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Design Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select value={formData.template} onValueChange={(value) => handleChange("template", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal-light">Minimal Light</SelectItem>
                    <SelectItem value="corporate-indigo">Corporate Indigo</SelectItem>
                    <SelectItem value="bold-accent">Bold Accent</SelectItem>
                    <SelectItem value="monochrome-pro">Monochrome Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                <Select value={formData.aspectRatio} onValueChange={(value) => handleChange("aspectRatio", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape (3:2)</SelectItem>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="portrait">Portrait (2:3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating..." : "Create Card"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <div className="lg:sticky lg:top-4 h-fit">
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <CardPreview cardData={formData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}