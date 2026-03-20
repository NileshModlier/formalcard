import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, AlertTriangle, Search } from "lucide-react"

async function getGstVerifications(searchQuery?: string) {
  const where: any = {}

  if (searchQuery) {
    where.OR = [
      { gstin: { contains: searchQuery, mode: "insensitive" } },
      { companyName: { contains: searchQuery, mode: "insensitive" } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
    ]
  }

  const verifications = await prisma.gstVerification.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return verifications
}

export default async function AdminGstPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const verifications = await getGstVerifications(searchParams.q)

  const pendingVerifications = verifications.filter((v) => !v.verified)
  const verifiedVerifications = verifications.filter((v) => v.verified)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GST Verification</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve GST verifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                type="search"
                placeholder="Search by GSTIN, company, or user..."
                className="pl-10"
                defaultValue={searchParams.q}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingVerifications.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {verifiedVerifications.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verifications */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
        {pendingVerifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending verifications
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingVerifications.map((verification) => (
              <Card key={verification.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{verification.companyName}</CardTitle>
                      <CardDescription>{verification.gstin}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {verification.mismatchWarning && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Mismatch
                        </Badge>
                      )}
                      {verification.manualReview && (
                        <Badge variant="outline">
                          Manual Review
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">User</div>
                      <div className="font-medium">{verification.user.name || verification.user.email}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Legal Name</div>
                      <div className="font-medium">{verification.legalName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Trade Name</div>
                      <div className="font-medium">{verification.tradeName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className="font-medium">{verification.registrationStatus || "N/A"}</div>
                    </div>
                  </div>

                  {verification.natureOfBusiness && (
                    <div>
                      <div className="text-sm text-muted-foreground">Nature of Business</div>
                      <div className="text-sm">{verification.natureOfBusiness}</div>
                    </div>
                  )}

                  {verification.address && (
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="text-sm">{verification.address}</div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <GstActionButton
                      verificationId={verification.id}
                      userId={verification.userId}
                      action="approve"
                    />
                    <GstActionButton
                      verificationId={verification.id}
                      action="reject"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Verified Verifications */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Verified Verifications</h2>
        {verifiedVerifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No verified verifications
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {verifiedVerifications.map((verification) => (
              <Card key={verification.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{verification.companyName}</div>
                      <div className="text-sm text-muted-foreground">{verification.gstin}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Verified on {new Date(verification.verifiedAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GstActionButton({
  verificationId,
  userId,
  action,
}: {
  verificationId: string
  userId: string
  action: "approve" | "reject"
}) {
  const handleClick = async () => {
    const response = await fetch(`/api/admin/gst/${verificationId}/${action}`, {
      method: "POST",
    })

    if (response.ok) {
      window.location.reload()
    }
  }

  return (
    <Button
      variant={action === "approve" ? "default" : "destructive"}
      onClick={handleClick}
    >
      {action === "approve" ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve & Refund
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 mr-2" />
          Reject
        </>
      )}
    </Button>
  )
}