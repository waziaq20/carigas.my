import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { Prisma, PrismaClient } from "../lib/generated/prisma/client"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

const shops = [
  {
    name: "PCI Gas Trading Sdn Bhd",
    address:
      "Lot 15809/1233-S1, Jalan Batu Bata, Off Jalan Bukit Kemuning, Seksyen 35, 40460 Shah Alam, Selangor",
    lat: 3.025,
    lng: 101.52,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "03-51249312 / 03-51211170",
    approved: true,
  },
  {
    name: "S.K. Gas (M) Sdn Bhd",
    address:
      "Lot 17, Jalan Perusahaan 4, Kawasan Perusahaan Batu Caves, 68100 Batu Caves, Selangor",
    lat: 3.235,
    lng: 101.68,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "03-61879311 / 016-2210110",
    approved: true,
  },
  {
    name: "GoGas Delivery",
    address: "USJ / Subang Jaya area, Selangor",
    lat: 3.048,
    lng: 101.58,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "018-2700671",
    approved: true,
  },
  {
    name: "Subang Jaya Gas Delivery (Al Falah)",
    address: "Subang Jaya / USJ, Selangor",
    lat: 3.05,
    lng: 101.59,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "017-8802016",
    approved: true,
  },
  {
    name: "TKG Gas",
    address: "Kuala Selangor / Tanjong Karang area, Selangor",
    lat: 3.35,
    lng: 101.25,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "019-3082416 / 012-3665618",
    approved: true,
  },
  {
    name: "Pasar Mini Ali Khan Gas Delivery",
    address:
      "60G-66G, Jalan Bandar 2, Pusat Bandar Puchong, 47100 Puchong, Selangor",
    lat: 3,
    lng: 101.62,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "Check PMak.com.my",
    approved: true,
  },
  {
    name: "Ionnex Gas (Petronas Supplier)",
    address: "Kuala Lumpur & Selangor coverage",
    lat: 3.1,
    lng: 101.6,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "017-6835138",
    approved: true,
  },
  {
    name: "Takaza LPG Trading (Petronas Delivery)",
    address: "Bangsar / Selangor areas (Puchong, Shah Alam etc.)",
    lat: 3.12,
    lng: 101.65,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "012-9095390",
    approved: true,
  },
  {
    name: "Cargas Gas Delivery",
    address: "1-2, Persiaran Meru Point, Gerbang Meru Indah, 30020 Ipoh, Perak",
    lat: 4.62,
    lng: 101.07,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "018-9696974",
    approved: true,
  },
  {
    name: "Vigor Trading Sdn Bhd (Petronas Premier Dealer)",
    address:
      "Plot 83, Lebuh Perusahaan Klebang 12, IGB International Industrial Park, 31200 Ipoh, Perak",
    lat: 4.59,
    lng: 101.09,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "05-2917288 / 017-5757388",
    approved: true,
  },
  {
    name: "Syarikat Bintang Emas Sdn Bhd",
    address: "81, Jalan Pegoh, Taman Pengkalan Jaya, 31650 Ipoh, Perak",
    lat: 4.58,
    lng: 101.08,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "05-3212289",
    approved: true,
  },
  {
    name: "Merit Gas Ipoh",
    address:
      "Near Siraga Tasek / Chemor area, Ipoh, Perak (LPG Exchange Centre)",
    lat: 4.6,
    lng: 101.1,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "Check Facebook MeritGasMY",
    approved: true,
  },
  {
    name: "JayKom Gas Delivery",
    address: "Ipoh area (delivery service), Perak",
    lat: 4.6,
    lng: 101.08,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "010-4084408",
    approved: true,
  },
  {
    name: "ATIF Gas Delivery",
    address:
      "No. 8 Kompleks PKNP, Jalan Pasar, Kampung Sungai Tapah Tambahan, Ipoh, Perak",
    lat: 4.58,
    lng: 101.05,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "012-5389597",
    approved: true,
  },
  {
    name: "KJ Agency Sdn Bhd (Petronas Authorised)",
    address: "No. 84, Taman Sri Daya, 75350 Batu Berendam, Melaka",
    lat: 2.243,
    lng: 102.258,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "06-3174823 / 012-6363263",
    approved: true,
  },
  {
    name: "Syarikat Noor Gas Delivery",
    address: "Taman Bunga Raya, Bukit Beruang, Melaka",
    lat: 2.25,
    lng: 102.25,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "06-2321621 / 016-6016527",
    approved: true,
  },
  {
    name: "Diman Juara Gas Delivery",
    address: "Melaka area (various coverage)",
    lat: 2.2,
    lng: 102.25,
    exchange: true,
    sellNew: true,
    price: 2660,
    phone: "Check Facebook Diman Juara",
    approved: true,
  },
] satisfies Prisma.ShopCreateInput[]

async function main() {
  let created = 0
  let updated = 0

  for (const shop of shops) {
    const existingShop = await prisma.shop.findFirst({
      where: {
        name: shop.name,
        address: shop.address,
      },
    })

    if (existingShop) {
      await prisma.shop.update({
        where: {
          id: existingShop.id,
        },
        data: shop,
      })
      updated += 1
      continue
    }

    await prisma.shop.create({
      data: shop,
    })
    created += 1
  }

  console.log(`Seeded shops: ${created} created, ${updated} updated`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
