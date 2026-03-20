import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Suspense } from "react"

async function getUsers(searchQuery?: string) {
  const where: any = {}

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          cards: {
            where: { isDeleted: false },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return users
}

function UsersList({ users }: { users: any[] }) {
  const handleToggleSuspend = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "suspended" ? "verified_member" : "suspended"
    
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })

    if (response.ok) {
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold">{user.name || "Unknown"}</h3>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Cards: {user._count.cards}</span>
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {user.role !== "admin" && (
                  <Button
                    variant={user.role === "suspended" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleSuspend(user.id, user.role)}
                  >
                    {user.role === "suspended" ? (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        Suspend
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const users = await getUsers(searchParams.q)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Find users by name or email</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <Input
              name="q"
              type="search"
              placeholder="Search by name or email..."
              defaultValue={searchParams.q}
            />
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role !== "suspended").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "suspended").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UsersList users={users} />
      </Suspense>
    </div>
  )
}