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

    // Single aggregate with $facet replaces 4 separate find() round-trips.
    // Each facet runs in parallel inside MongoDB — one network hop total.
    const [result] = await WorkoutLog.aggregate([
        { $match: { client: req.user._id } },
        {
            $facet: {
                weekly: [
                    { $match: { date: { $gte: startOfWeek } } },
                    {
                        $group: {
                            _id: null,
                            sessions: { $sum: 1 },
                            totalVolumeKg: {
                                $sum: {
                                    $reduce: {
                                        input: "$exercises",
                                        initialValue: 0,
                                        in: {
                                            $add: ["$$value", {
                                                $reduce: {
                                                    input: "$$this.sets",
                                                    initialValue: 0,
                                                    in: { $add: ["$$value", { $multiply: ["$$this.reps", "$$this.weight"] }] }
                                                }
                                            }]
                                        }
                                    }
                                }
                            },
                            durationsArr: { $push: "$durationMinutes" }
                        }
                    }
                ],
                monthly: [
                    { $match: { date: { $gte: startOfMonth } } },
                    {
                        $group: {
                            _id: null,
                            sessions: { $sum: 1 },
                            totalVolumeKg: {
                                $sum: {
                                    $reduce: {
                                        input: "$exercises",
                                        initialValue: 0,
                                        in: {
                                            $add: ["$$value", {
                                                $reduce: {
                                                    input: "$$this.sets",
                                                    initialValue: 0,
                                                    in: { $add: ["$$value", { $multiply: ["$$this.reps", "$$this.weight"] }] }
                                                }
                                            }]
                                        }
                                    }
                                }
                            },
                            durationsArr: { $push: "$durationMinutes" }
                        }
                    }
                ],
                allTime: [
                    { $sort: { date: -1 } },
                    {
                        $group: {
                            _id: null,
                            totalSessions: { $sum: 1 },
                            dates: { $push: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }
                        }
                    }
                ],
                breakdown: [
                    { $match: { date: { $gte: sixMonthsAgo } } },
                    {
                        $group: {
                            _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                            sessions: { $sum: 1 },
                            volume: {
                                $sum: {
                                    $reduce: {
                                        input: "$exercises",
                                        initialValue: 0,
                                        in: {
                                            $add: ["$$value", {
                                                $reduce: {
                                                    input: "$$this.sets",
                                                    initialValue: 0,
                                                    in: { $add: ["$$value", { $multiply: ["$$this.reps", "$$this.weight"] }] }
                                                }
                                            }]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ]
            }
        }
    ]);

    // ── Post-process in JS (cheap — already aggregated) ────────────────────
    const avgDuration = (durArr = []) => {
        const valid = durArr.filter(Boolean);
        return valid.length ? +(valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(1) : 0;
    };

    const weeklyData = result.weekly[0] ?? { sessions: 0, totalVolumeKg: 0, durationsArr: [] };
    const monthlyData = result.monthly[0] ?? { sessions: 0, totalVolumeKg: 0, durationsArr: [] };
    const allTimeData = result.allTime[0] ?? { totalSessions: 0, dates: [] };

    // Streak — consecutive days ending today that have ≥1 log
    const logDates = new Set(allTimeData.dates);
    let streak = 0;
    const cursor = new Date(now);
    while (logDates.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyBreakdown = result.breakdown.map(item => ({
        month: `${monthNames[item._id.month - 1]} ${String(item._id.year).slice(2)}`,
        sessions: item.sessions,
        volume: item.volume
    }));

    res.status(200).json({
        success: true,
        data: {
            weekly: {
                sessions:       weeklyData.sessions,
                totalVolumeKg:  weeklyData.totalVolumeKg,
                avgDurationMin: avgDuration(weeklyData.durationsArr),
            },
            monthly: {
                sessions:       monthlyData.sessions,
                totalVolumeKg:  monthlyData.totalVolumeKg,
                avgDurationMin: avgDuration(monthlyData.durationsArr),
            },
            allTime: {
                totalSessions: allTimeData.totalSessions,
                currentStreak: streak,
            },
            monthlyBreakdown,
        }
    });
});

