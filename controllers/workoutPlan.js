import WorkoutPlan from "../models/WorkoutPlan.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notifyUser } from "../utils/notifyUser.js";
import PDFDocument from 'pdfkit';
// @desc create workout plan for user 
//  POST /api/v1/workout-plans
// @access private 
export const createWorkoutPlan = asyncHandler(async (req, res) => {
    const { planName, days, notes, description, clientId } = req.body;
    const existingPlane = await WorkoutPlan.findOne({ client: clientId });
    if (existingPlane) {
        return res.status(400).json({ success: false, message: "Workout plan already exists" });
    }
    const workoutPlan = await WorkoutPlan.create({ client: clientId, planName, days, notes, description });
    await notifyUser({
        userId: clientId,
        title: "Workout Plan Created",
        message: "Your workout plan has been created by your coach.",
        type: "workout",
        link: "/profile"
    });
    res.status(201).json({ success: true, data: workoutPlan });
})
// desc get all workout plans
// route GET /api/v1/workout-plans
// access private

export const getAllWorkoutPlans = asyncHandler(async (req, res) => {
    const workoutPlans = await WorkoutPlan.find()
        .populate("client", "userName email")
        .populate({
            path: "days.exercises.exerciseId",
            select: "name bodyPart"
        })
        .lean();
    res.status(200).json({ success: true, data: workoutPlans });
})

// desc get workout plan by id
// route GET /api/v1/workout-plans/:id
// access private
export const getWorkoutPlanById = asyncHandler(async (req, res) => {
    const workoutPlan = await WorkoutPlan.findById(req.params.id)
        .populate("client", "userName email")
        .populate({
            path: "days.exercises.exerciseId",
            select: "name bodyPart"
        });
    res.status(200).json({ success: true, data: workoutPlan });
})
// desc update workout plan
// route PUT /api/v1/workout-plans/:id
// access private
export const updateWorkoutPlan = asyncHandler(async (req, res) => {
    const { planName, days, notes, description, clientId } = req.body;
    
    // Only update client if clientId is provided, otherwise keep existing client
    const updateData = { planName, days, notes, description };
    if (clientId) {
        updateData.client = clientId;
    }
    
    const workoutPlan = await WorkoutPlan.findByIdAndUpdate(
        req.params.id, 
        updateData, 
        { new: true, runValidators: true }
    );
    if (workoutPlan) {
        await notifyUser({
            userId: workoutPlan.client,
            title: "Workout Plan Updated",
            message: "Your workout plan has been updated by your coach.",
            type: "workout",
            link: "/profile"
        });
    }
    res.status(200).json({ success: true, data: workoutPlan });
})
// desc delete workout plan
// route DELETE /api/v1/workout-plans/:id
// access private
export const deleteWorkoutPlan = asyncHandler(async (req, res) => {
    const workoutPlan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: workoutPlan });
})
// desc get client workout plan
// route GET /api/v1/workout-plans/me
// access private
export const getClientWorkoutPlan = asyncHandler(async (req, res) => {
    const workoutPlan = await WorkoutPlan.findOne({ client: req.user._id })
        .populate("client", "userName email")
        .populate({
            path: "days.exercises.exerciseId",
            select: "name bodyPart gifUrl instructions target equipment"
        });

    if (!workoutPlan) {
        return res.status(404).json({ success: false, message: "Workout plan not found" });
    }
    res.status(200).json({ success: true, data: workoutPlan });
})
// @desc download workout pdf 
// route GET /api/v1/workout-plans/:id/pdf
// access private 
export const downloadWorkoutPlanPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const plan = await WorkoutPlan.findById(id).populate('days.exercises.exerciseId');

    if (!plan) {
        return res.status(404).json({ message: "  workout not founded" });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Workout_Plan_${id}.pdf"`);
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    doc.fontSize(22).fillColor('#020617').text('FitCoach - Workout Plan', { align: 'center' });
    doc.moveDown(2);

    plan.days.forEach((day) => {
        doc.fontSize(18).fillColor('#1e40af').text(`Day: ${day.dayName}`);
        doc.moveDown(0.5);

        day.exercises.forEach((item, index) => {
            // Depending on how exercise is populated, we might need a fallback if it's missing or null
            const exerciseName = item.exerciseId?.name || 'Unknown Exercise';
            doc.fontSize(16).fillColor('#2563eb').text(`Workout ${index + 1}: ${exerciseName}`);
            doc.fontSize(12).fillColor('#000000').text(`Sets: ${item.sets} | Reps: ${item.reps}`);
            if (item.notes) {
                doc.fontSize(10).fillColor('gray').text(` Notes: ${item.notes}`);
            }
            doc.moveDown(1);
        });
        doc.moveDown(1);
    });

    doc.end();
});

