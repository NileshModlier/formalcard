import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 12)
  
  const user = await prisma.user.upsert({
    where: { email: "demo@formalcard.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@formalcard.com",
      password: hashedPassword,
      emailVerified: new Date(),
      role: "verified_member",
    },
  })

  console.log("✅ Created demo user:", user.email)

  // Create admin user
  const adminHashedPassword = await bcrypt.hash("admin123", 12)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@formalcard.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@formalcard.com",
      password: adminHashedPassword,
      emailVerified: new Date(),
      role: "admin",
    },
  })

  console.log("✅ Created admin user:", admin.email)

  // Create demo profile
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      phone: "+919876543210",
      company: "Tech Solutions Pvt Ltd",
      position: "CEO",
      bio: "Entrepreneur and tech enthusiast with 10+ years of experience",
      location: "Mumbai, India",
      linkedin: "https://linkedin.com/in/demo",
      website: "https://techsolutions.com",
      showInDirectory: true,
    },
  })

  console.log("✅ Created demo profile")

  // Create sample business cards
  const cards = [
    {
      userId: user.id,
      slug: "tech-solutions-pvt-ltd",
      gstin: "27AAAC1234F1Z5",
      companyName: "Tech Solutions Pvt Ltd",
      brandName: "TechSolutions",
      officialEmail: "contact@techsolutions.com",
      personalEmail: "demo@formalcard.com",
      phone: "+919876543210",
      address: "123 Tech Park, Andheri East, Mumbai - 400069",
      designation: "Chief Executive Officer",
      areaOfBusiness: "Software Development",
      template: "minimal-light",
      aspectRatio: "landscape",
    },
    {
      userId: user.id,
      slug: "innovate-india",
      gstin: "29BBBC5678G2Z6",
      companyName: "Innovate India Solutions",
      brandName: "InnovateIndia",
      officialEmail: "info@innovateindia.com",
      phone: "+919876543211",
      address: "456 Innovation Hub, Koramangala, Bangalore - 560034",
      designation: "Product Manager",
      areaOfBusiness: "SaaS & Cloud Services",
      template: "corporate-indigo",
      aspectRatio: "landscape",
    },
    {
      userId: user.id,
      slug: "global-trade-exports",
      gstin: "27CCCCD999H3Z7",
      companyName: "Global Trade Exports",
      brandName: null,
      officialEmail: "sales@globaltrade.com",
      phone: "+919876543212",
      address: "789 Business Centre, Sector 62, Noida - 201309",
      designation: "Sales Director",
      areaOfBusiness: "International Trade",
      template: "bold-accent",
      aspectRatio: "square",
    },
  ]

  for (const cardData of cards) {
    await prisma.businessCard.create({
      data: cardData,
    })
  }

  console.log("✅ Created sample business cards")

  console.log("🎉 Seed completed successfully!")
  console.log("\n📝 Demo Credentials:")
  console.log("   Email: demo@formalcard.com")
  console.log("   Password: password123")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })