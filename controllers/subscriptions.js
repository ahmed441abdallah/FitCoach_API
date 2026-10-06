import asyncHandler from "../utils/asyncHandler.js";
import Package from "../models/Package.js";
import Cupon from "../models/Cupon.js";
import Subscription from "../models/Subscription.js";
import Client from "../models/Client.js";
import { sendTelegramAlert } from "../utils/telegram.js";
import { sendEmail } from "../utils/sendEmail.js";
import PDFDocument from "pdfkit";

// @desc    calculate subscription
// @route   POST /api/v1/subscriptions/calculate
// @access  Private
export const calculateSubscription = asyncHandler(async (req, res) => {
    // تصليح الـ Typos في أسماء المتغيرات
    const { packageId, couponCode, pricingOptionId } = req.body;

    // 1. find package
    const pkg = await Package.findById(packageId);
    if (!pkg) {
        return res.status(404).json({ success: false, message: "Package not found" });
    }

    // 2. find selected price 
    const pricingOption = pkg.pricingOptions.id(pricingOptionId);
    if (!pricingOption) {
        return res.status(404).json({ success: false, message: "Pricing option not found" });
    }

    let discountPercent = 0;
    let discountAmount = 0;
    let finalPrice = pricingOption.price; // السعر الافتراضي بدون خصم

    // 3. check coupon code
    if (couponCode) {
        const cupon = await Cupon.findOne({ code: couponCode.toUpperCase() });

        if (!cupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }
        if (cupon.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "This coupon has expired" });
        }

        // apply coupon
        discountPercent = cupon.discount;
        discountAmount = (pricingOption.price * discountPercent) / 100;
        finalPrice = pricingOption.price - discountAmount;
    }

    // إرسال الرد في الحالتين (بخصم أو بدون) لحل مشكلة التعليق
    res.json({
        success: true,
        data: {
            package: pkg.name,
            originalPrice: pricingOption.price,
            discountPercent,
            discountAmount,
            finalPrice
        }
    });
});


// @desc    buy subscription
// @route   POST /api/v1/subscriptions
// @access  Private
export const buySubscription = asyncHandler(async (req, res) => {
    const { packageId, pricingOptionId, paymentProof, paymentMethod, couponCode } = req.body;
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Payment proof image is required"
        });
    }
    // check if the user has completed their profile
    const clientProfile = await Client.findOne({ user: req.user._id });
    if (!clientProfile) {
        return res.status(403).json({
            success: false,
            message: "Please complete your profile first",
            requiresOnboarding: true
        });
    }

    // check if the user has already paid for a subscription ( active or pending )
    const existingSub = await Subscription.findOne({
        client: req.user._id,
        status: { $in: ['pending', 'active'] }
    });
    if (existingSub) {
        return res.status(400).json({
            success: false,
            message: "You already have an active or pending subscription"
        });
    }
    // find the package
    const pkg = await Package.findById(packageId);
    if (!pkg) {
        return res.status(404).json({ success: false, message: "Package not found" });
    }
    // find the pricing option
    const pricingOption = pkg.pricingOptions.id(pricingOptionId);
    if (!pricingOption) {
        return res.status(404).json({ success: false, message: "Pricing option not found" });
    }
    // calculate the final price
    let discountPercent = 0;
    let discountAmount = 0;
    let finalPrice = pricingOption.price;
    let appliedCoupon = null;

    // 2. Check Coupon (If prvoided)
    if (couponCode) {
        const cupon = await Cupon.findOne({ code: couponCode.toUpperCase() });

        if (!cupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }
        if (cupon.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "This coupon has expired" });
        }

        appliedCoupon = cupon.code;
        discountPercent = cupon.discount;
        discountAmount = (pricingOption.price * discountPercent) / 100;
        finalPrice = pricingOption.price - discountAmount;
    }

    // 3. Create Subscription
    const subscription = await Subscription.create({
        client: req.user._id,
        package: packageId,
        pricingOption: pricingOptionId,
        paymentMethod,
        paymentProof,
        couponCode: appliedCoupon,
        originalPrice: pricingOption.price,
        discountAmount,
        totalPrice: finalPrice,
        durationInMonths: pricingOption.durationInMonths,
        endDate: Date.now() + (pricingOption.durationInMonths * 30 * 24 * 60 * 60 * 1000),
    });
    const alertMessage = `
🆕 <b>New Subscription Request!</b>

📧 <b> Trainee Email:</b> ${req.user.email}
➖➖➖➖➖➖➖➖➖➖
📦 <b>Package:</b> ${pkg.name} <i>(${pricingOption.durationInMonths} Months)</i>
💵 <b>Amount Paid:</b> ${finalPrice} EGP
💳 <b>Method:</b> ${paymentMethod.toUpperCase()}
➖➖➖➖➖➖➖➖➖➖
🧾 <a href="${req.body.paymentProof}"><b>📄 View Payment Proof</b></a>

⚙️ <i>Action Required: Please check your admin dashboard to approve or reject this request.</i>
`;

    sendTelegramAlert(alertMessage).catch(err => console.log("Telegram Error:", err));

    res.status(201).json({
        success: true,
        data: subscription
    });
});
// desc get all subscriptions
// route GET /api/v1/subscriptions
// access private
export const getSubscriptions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [subscriptions, count] = await Promise.all([
        Subscription.find()
            .populate('package', 'name ')
            .populate('client', 'userName email')
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit)
            .lean(),
        Subscription.countDocuments()
    ]);

    res.status(200).json({
        success: true,
        data: subscriptions,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
            hasNextPage: page < Math.ceil(count / limit),
            hasPrevPage: page > 1
        }
    });
});
// @desc    Get Single Subscription
// @route   GET /api/v1/subscriptions/:id
// @access  Private
export const getSingleSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findById(req.params.id)
        .populate('package', 'name')
        .populate('client', 'userName email');
    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }
    res.status(200).json({
        success: true,
        data: subscription
    });
});
// @desc    Client Get His Subscriptions
// @route   GET /api/v1/subscriptions/me
// @access  Private
export const getMySubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.find({ client: req.user._id })
        .populate('package', 'name');
    res.status(200).json({
        success: true,
        data: subscription
    });
});
// desc approve subscription
// route PUT /api/v1/subscriptions/:id/approve
// access private
export const approveSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findById(req.params.id)
        .populate('client', 'userName email')
        .populate('package', 'name');
    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }
    const updated = await Subscription.findByIdAndUpdate(
        req.params.id,
        { status: "active", paymentStatus: "paid" },
        { new: true, runValidators: false }
    ).populate('client', 'userName email').populate('package', 'name');

    sendEmail({
        to: updated.client.email,
        subject: '\u2705 Your Subscription is Approved!',
        data: {
            name: updated.client.userName,
            package: updated.package.name,
            endDate: updated.endDate
        }
    }).catch(err => console.error("Email error (approve):", err.message));
    await notifyUser({
        userId: updated.client._id,
        title: "Your Subscription is Approved!",
        message: `Your subscription to ${updated.package.name} has been approved.`,
        type: "subscription",
        link: `/subscriptions/${updated._id}`
    });

    res.status(200).json({
        success: true,
        data: updated
    });
});
// desc reject subscription
// route PUT /api/v1/subscriptions/:id/reject
// access private
export const rejectSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findById(req.params.id)
        .populate('client', 'userName email')
        .populate('package', 'name');
    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }
    const updated = await Subscription.findByIdAndUpdate(
        req.params.id,
        { status: "cancelled", paymentStatus: "failed" },
        { new: true, runValidators: false }
    ).populate('client', 'userName email').populate('package', 'name');

    sendEmail({
        to: updated.client.email,
        subject: 'Your Subscription has been Rejected',
        data: {
            name: updated.client.userName,
            package: updated.package.name,
        }
    }).catch(err => console.error("Email error (reject):", err.message));
    await notifyUser({
        userId: updated.client._id,
        title: "Your Subscription has been Rejected",
        message: `Your subscription to ${updated.package.name} has been rejected.`,
        type: "subscription",
        link: `/subscriptions/${updated._id}`
    });

    res.status(200).json({
        success: true,
        data: updated
    });
});
// desc generate invoice
// route GET /api/v1/subscriptions/:subscriptionId/invoice
// access private
export const generateInvoice = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId)
        .populate('client package');

    if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
    }

    const doc = new PDFDocument();
    const fileName = `invoice-${subscription._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    doc.pipe(res);
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.fontSize(12).text(`Invoice #${subscription._id}`, { align: 'center' });
    doc.moveDown();

    doc.text(`Date: ${subscription.createdAt.toLocaleDateString()}`);
    doc.text(`Package: ${subscription.package.name}`);

    if (subscription.discountAmount > 0) {
        doc.text(`Original Amount: ${subscription.totalPrice + subscription.discountAmount} EGP`);
        doc.text(`Discount: -${subscription.discountAmount} EGP`);
    }

    doc.text(`Total Paid: ${subscription.totalPrice} EGP`);
    doc.text(`Duration: ${subscription.durationInMonths} Months`);
    doc.text(`Valid Until: ${subscription.endDate.toLocaleDateString()}`);

    doc.end();
});

// @desc    Get Admin Dashboard Stats
// @route   GET /api/v1/subscriptions/stats/dashboard
// @access  Private (Admin)
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
    // 1. Total Revenue (all paid subscriptions)
    const revenueAggregation = await Subscription.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // 2. Active Trainees
    const activeTrainees = await Subscription.countDocuments({ status: 'active' });

    // 3. Pending Approvals
    const pendingApprovals = await Subscription.countDocuments({ status: 'pending' });

    // 4. Expiring Soon (active subscriptions ending in the next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSoon = await Subscription.countDocuments({
        status: 'active',
        endDate: { $lte: sevenDaysFromNow, $gte: new Date() }
    });

    // 5. Recent Activity (last 5 subscriptions created or updated)
    const recentActivity = await Subscription.find()
        .populate('client', 'userName email')
        .populate('package', 'name')
        .sort({ updatedAt: -1 })
        .limit(5);

    // 6. Revenue Trend (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Subscription.aggregate([
        {
            $match: {
                paymentStatus: 'paid',
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: "$totalPrice" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format monthly revenue for charts
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = monthlyRevenue.map(item => ({
        month: monthNames[item._id.month - 1],
        revenue: item.revenue
    }));

    res.status(200).json({
        success: true,
        data: {
            stats: {
                totalRevenue,
                activeTrainees,
                pendingApprovals,
                expiringSoon
            },
            recentActivity,
            revenueData
        }
    });
});