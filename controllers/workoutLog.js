import asyncHandler from "../utils/asyncHandler.js";
import WorkoutLog from "../models/workoutLog.js";

// @desc    Log a completed workout
// @route   POST /api/v1/workout-logs
// @access  Private
export const logWorkout = asyncHandler(async (req, res) => {
    const { date, workoutPlan, dayName, overallMood, durationMinutes, generalNotes, exercises } = req.body;
    const workoutLog = await WorkoutLog.create({
        client: req.user._id,
        workoutPlan,
        dayName,
        overallMood,
        generalNotes,
        date,
        durationMinutes,
        exercises
    });
    res.status(201).json({ success: true, data: workoutLog });
});

// @desc    Get my workout logs (newest first)
// @route   GET /api/v1/workout-logs/me
// @access  Private
export const getMyWorkoutLogs = asyncHandler(async (req, res) => {
    const workoutLogs = await WorkoutLog
        .find({ client: req.user._id })
        .sort({ date: -1 })
        .populate("workoutPlan", "planName")
        .populate("exercises.exerciseId", "name bodyPart");
    res.status(200).json({ success: true, count: workoutLogs.length, data: workoutLogs });
});

// @desc    Admin — view a specific client's workout logs
// @route   GET /api/v1/workout-logs/:clientId
// @access  Private/Admin
export const getClientLogs = asyncHandler(async (req, res) => {
    const workoutLogs = await WorkoutLog
        .find({ client: req.params.clientId })
        .sort({ date: -1 })
        .populate("workoutPlan", "planName")
        .populate("exercises.exerciseId", "name bodyPart");
    res.status(200).json({ success: true, count: workoutLogs.length, data: workoutLogs });
});

// @desc    Get weekly & monthly workout stats for the logged-in user
// @route   GET /api/v1/workout-logs/me/stats
// @access  Private
export const getStats = asyncHandler(async (req, res) => {
    const now = new Date();

    // Start of current week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of 6-month window (for chart breakdown)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Run all DB queries in parallel
    const [weeklyLogs, monthlyLogs, allLogs, recentLogs] = await Promise.all([
        WorkoutLog.find({ client: req.user._id, date: { $gte: startOfWeek } }),
        WorkoutLog.find({ client: req.user._id, date: { $gte: startOfMonth } }),
        WorkoutLog.find({ client: req.user._id }).sort({ date: -1 }),
        WorkoutLog.find({ client: req.user._id, date: { $gte: sixMonthsAgo } }),
    ]);

    // Total volume (reps × weight) across a set of logs
    const calcVolume = (logs) =>
        logs.reduce((total, log) =>
            total + log.exercises.reduce((ex, e) =>
                ex + e.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0), 0);

    // Average session duration, ignoring logs without a recorded duration
    const avgDuration = (logs) => {
        const withDur = logs.filter(l => l.durationMinutes);
        return withDur.length
            ? +(withDur.reduce((s, l) => s + l.durationMinutes, 0) / withDur.length).toFixed(1)
            : 0;
    };

    // Current streak — consecutive days ending today that have at least one log
    const logDates = new Set(allLogs.map(l => new Date(l.date).toISOString().slice(0, 10)));
    let streak = 0;
    const cursor = new Date(now);
    while (logDates.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    // 6-month monthly breakdown for front-end bar chart
    const breakdown = {};
    recentLogs.forEach(log => {
        const key = new Date(log.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!breakdown[key]) breakdown[key] = { month: key, sessions: 0, volume: 0 };
        breakdown[key].sessions += 1;
        breakdown[key].volume += log.exercises.reduce((t, e) =>
            t + e.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0);
    });

    res.status(200).json({
        success: true,
        data: {
            weekly: {
                sessions:       weeklyLogs.length,
                totalVolumeKg:  calcVolume(weeklyLogs),
                avgDurationMin: avgDuration(weeklyLogs),
            },
            monthly: {
                sessions:       monthlyLogs.length,
                totalVolumeKg:  calcVolume(monthlyLogs),
                avgDurationMin: avgDuration(monthlyLogs),
            },
            allTime: {
                totalSessions: allLogs.length,
                currentStreak: streak,
            },
            monthlyBreakdown: Object.values(breakdown),
        }
    });
});
