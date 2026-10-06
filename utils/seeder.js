import mongoose from "mongoose";
import dotenv from "dotenv";
import Package from "../models/Package.js";
import databaseConnction from "../config/database.js";

dotenv.config();

const packages = [
    {
        name: "Starter",
        pricingOptions: [
            { durationInMonths: 1, price: 29 },
            { durationInMonths: 3, price: 75 },
            { durationInMonths: 6, price: 139 },
        ],
        description: [
            "AI-generated workout plan",
            "Basic nutrition guide",
            "3 check-ins per month",
            "Access to exercise library",
            "Email support",
        ],
    },
    {
        name: "Core",
        pricingOptions: [
            { durationInMonths: 1, price: 79 },
            { durationInMonths: 3, price: 210 },
            { durationInMonths: 6, price: 390 },
        ],
        description: [
            "Custom weekly workout plans",
            "Full macro nutrition coaching",
            "Weekly 1-on-1 video call",
            "Progress photo reviews",
            "Priority chat support",
            "Body composition tracking",
        ],
    },
    {
        name: "Elite",
        pricingOptions: [
            { durationInMonths: 1, price: 149 },
            { durationInMonths: 3, price: 399 },
            { durationInMonths: 6, price: 749 },
        ],
        description: [
            "Everything in Core",
            "Daily plan adjustments",
            "Bi-weekly strategy calls",
            "Supplement guidance",
            "Injury prevention program",
            "Mental performance coaching",
        ],
    },
    {
        name: "VIP",
        pricingOptions: [
            { durationInMonths: 1, price: 299 },
            { durationInMonths: 3, price: 799 },
            { durationInMonths: 6, price: 1499 },
        ],
        description: [
            "Everything in Elite",
            "Unlimited 1-on-1 sessions",
            "Dedicated personal coach",
            "Custom lab & biometric review",
            "Travel & competition prep",
            "24/7 direct coach access",
        ],
    },
];

const seedPackages = async () => {
    try {
        await databaseConnction();

        // Clear existing packages
        await Package.deleteMany();
        console.log("🗑️  Old packages removed");

        // Insert seed data
        const created = await Package.insertMany(packages);
        console.log(`✅ ${created.length} packages seeded successfully`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
};

// Run with: node utils/seeder.js
seedPackages();
