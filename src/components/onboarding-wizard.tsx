"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Shield, CreditCard, Phone } from "lucide-react"
import { toast } from "sonner"

interface OnboardingWizardProps {
  userId: string
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    gstin: "",
    companyName: "",
    brandName: "",
    mobileNumber: "",
    otp: "",
  })

  const [gstVerification, setGstVerification] = useState<any>(null)
  const [otpVerified, setOtpVerified] = useState(false)

  const steps = [
    { id: 1, title: "GST Verification", icon: Shield },
    { id: 2, title: "Mobile Verification", icon: Phone },
    { id: 3, title: "Refundable Deposit", icon: CreditCard },
  ]

  const handleGstVerification = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/onboarding/gst-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gstin: formData.gstin,
          companyName: formData.companyName,
          brandName: formData.brandName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "GST verification failed")
      }

      setGstVerification(data)
      setStep(2)
      toast.success("GST verified successfully!")
    } catch (error: any) {
      toast.error(error.message || "GST verification failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendOtp = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/onboarding/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: formData.mobileNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      toast.success("OTP sent successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/onboarding/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          otp: formData.otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed")
      }

      setOtpVerified(true)
      setStep(3)
      toast.success("Mobile verified successfully!")
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayment = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/onboarding/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit",
          amount: 5000,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment initialization failed")
      }

      // Redirect to payment page
      router.push(`/onboarding/payment?orderId=${data.orderId}`)
    } catch (error: any) {
      toast.error(error.message || "Payment initialization failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Business Verification</CardTitle>
        <CardDescription>
          Step {step} of {steps.length}: {steps[step - 1].title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  s.id < step
                    ? "bg-green-500 border-green-500 text-white"
                    : s.id === step
                    ? "bg-primary border-primary text-white"
                    : "border-slate-300 text-slate-300"
                }`}
              >
                {s.id < step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-2 hidden md:block">
                <div
                  className={`text-sm font-medium ${
                    s.id <= step ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {s.title}
                </div>
              </div>
              {s.id < steps.length && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    s.id < step ? "bg-green-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: GST Verification */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Why GST Verification?
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    GST verification helps us confirm your business identity and prevents spam registrations.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN *</Label>
                <Input
                  id="gstin"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({ ...formData, gstin: e.target.value.toUpperCase() })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter your 15-character GST Identification Number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Registered Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company Ltd"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name (Optional)</Label>
                <Input
                  id="brandName"
                  placeholder="Brand or Trade Name"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                />
              </div>

              {gstVerification && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        GST Verified
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                        Legal Name: {gstVerification.legalName}
                      </p>
                      {gstVerification.mismatchWarning && (
                        <div className="flex items-start space-x-2 mt-2 text-yellow-700 dark:text-yellow-200">
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                          <p className="text-sm">
                            There's a slight mismatch with the company name. Our team will review it.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleGstVerification} disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify GST"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Mobile Verification */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Mobile Verification
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Verify your mobile number to secure your account and enable messaging features.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Use E.164 format: +91 followed by 10 digits
                </p>
              </div>

              {!otpVerified && (
                <Button
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={isSubmitting || !formData.mobileNumber}
                  className="w-full"
                >
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </Button>
              )}

              {formData.mobileNumber && !otpVerified && (
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP *</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({ ...formData, otp: e.target.value })
                    }
                    maxLength={6}
                  />
                </div>
              )}

              {otpVerified && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Mobile Verified
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                        {formData.mobileNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={isSubmitting || !otpVerified}
              >
                {isSubmitting ? "Verifying..." : "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Refundable Deposit */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Refundable Security Deposit
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    A one-time refundable deposit of ₹5,000 to prevent spam and unauthorized registrations.
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">₹5,000</CardTitle>
                <CardDescription>Refundable Security Deposit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">100% Refundable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Refund within 72 hours after GST approval</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Refund sent to original UPI source</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Prevents spam and fake registrations</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Important Note
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                    This ₹5,000 deposit is 100% refundable once your GST number is validated with the respective owner. 
                    Refund will be sent to your original UPI source within 72 hours after authentication.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handlePayment} disabled={isSubmitting} size="lg">
                {isSubmitting ? "Processing..." : "Pay ₹5,000"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}