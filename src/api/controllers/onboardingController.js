const winston = require('winston');
const Onboarding = require('../../models/Onboarding');
const Task = require('../../models/Task');
const watsonxService = require('../../services/watsonxService');
const workflowEngine = require('../../workflows/engine');
const emailService = require('../../services/emailService');
const slackService = require('../../services/slackService');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Create a new onboarding instance
 */
exports.createOnboarding = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
      department,
      startDate,
      managerId,
      location
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role || !department || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'role', 'department', 'startDate']
      });
    }

    // Check if onboarding already exists for this email
    const existingOnboarding = await Onboarding.findOne({ email: email.toLowerCase() });
    if (existingOnboarding) {
      return res.status(409).json({
        error: 'Onboarding already exists for this email'
      });
    }

    // Generate employee ID
    const employeeId = `EMP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Create onboarding record in database
    const onboarding = new Onboarding({
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      role,
      department,
      startDate: new Date(startDate),
      managerId,
      location,
      status: 'pending',
      createdBy: req.user.id
    });

    await onboarding.save();

    logger.info(`Creating onboarding for ${firstName} ${lastName}`, { employeeId });

    // Create default tasks
    const defaultTasks = [
      {
        onboardingId: onboarding._id,
        name: 'Complete IT security training',
        description: 'Complete the mandatory security awareness training',
        category: 'training',
        dueDate: new Date(startDate),
        order: 1
      },
      {
        onboardingId: onboarding._id,
        name: 'Set up work email',
        description: 'Access your work email and set up your profile',
        category: 'technical',
        dueDate: new Date(startDate),
        order: 2
      },
      {
        onboardingId: onboarding._id,
        name: 'Meet with manager',
        description: 'Initial 1:1 meeting to discuss goals and expectations',
        category: 'meeting',
        dueDate: new Date(startDate),
        order: 3
      },
      {
        onboardingId: onboarding._id,
        name: 'Team introduction',
        description: 'Meet your team members',
        category: 'social',
        dueDate: new Date(startDate),
        order: 4
      }
    ];

    await Task.insertMany(defaultTasks);

    // Send welcome email
    await emailService.sendWelcomeEmail({
      firstName,
      lastName,
      email,
      startDate,
      role,
      department
    });

    // Send Slack welcome message if configured
    await slackService.sendWelcomeMessage(email, firstName, startDate);

    // Trigger watsonx Orchestrate workflow
    const workflowResult = await workflowEngine.triggerWorkflow('create_new_hire', {
      onboarding: onboarding.toObject(),
      employeeId
    });

    res.status(201).json({
      message: 'Onboarding created successfully',
      onboarding: {
        id: onboarding._id,
        employeeId: onboarding.employeeId,
        firstName: onboarding.firstName,
        lastName: onboarding.lastName,
        email: onboarding.email,
        role: onboarding.role,
        department: onboarding.department,
        startDate: onboarding.startDate,
        status: onboarding.status
      },
      workflowId: workflowResult.workflowId
    });

  } catch (error) {
    logger.error('Error creating onboarding:', error);
    res.status(500).json({
      error: 'Failed to create onboarding',
      message: error.message
    });
  }
};

/**
 * Get onboarding details by ID
 */
exports.getOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch from database
    const onboarding = await Onboarding.findById(id);
    
    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    // Fetch associated tasks
    const tasks = await Task.find({ onboardingId: id }).sort({ order: 1 });

    // Calculate progress
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    res.json({
      id: onboarding._id,
      employeeId: onboarding.employeeId,
      firstName: onboarding.firstName,
      lastName: onboarding.lastName,
      email: onboarding.email,
      role: onboarding.role,
      department: onboarding.department,
      status: onboarding.status,
      progress,
      startDate: onboarding.startDate,
      location: onboarding.location,
      accounts: onboarding.accounts,
      equipment: onboarding.equipment,
      tasks: tasks.map(t => ({
        id: t._id,
        name: t.name,
        description: t.description,
        status: t.status,
        category: t.category,
        dueDate: t.dueDate,
        completedAt: t.completedAt
      }))
    });

  } catch (error) {
    logger.error('Error fetching onboarding:', error);
    res.status(500).json({ error: 'Failed to fetch onboarding' });
  }
};

/**
 * Get all onboardings with optional filters
 */
exports.getAllOnboardings = async (req, res) => {
  try {
    const { status, department, startDate, limit = 50, offset = 0 } = req.query;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (startDate) filter.startDate = { $gte: new Date(startDate) };

    // Fetch from database with filters
    const onboardings = await Onboarding
      .find(filter)
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Onboarding.countDocuments(filter);

    // Calculate progress for each
    const onboardingsWithProgress = await Promise.all(
      onboardings.map(async (onb) => {
        const tasks = await Task.find({ onboardingId: onb._id });
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        return {
          id: onb._id,
          employeeId: onb.employeeId,
          name: `${onb.firstName} ${onb.lastName}`,
          firstName: onb.firstName,
          lastName: onb.lastName,
          email: onb.email,
          role: onb.role,
          department: onb.department,
          status: onb.status,
          progress,
          startDate: onb.startDate,
          createdAt: onb.createdAt
        };
      })
    );

    res.json({
      count: onboardingsWithProgress.length,
      total,
      onboardings: onboardingsWithProgress
    });

  } catch (error) {
    logger.error('Error fetching onboardings:', error);
    res.status(500).json({ error: 'Failed to fetch onboardings' });
  }
};

/**
 * Update onboarding status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update in database
    const onboarding = await Onboarding.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    logger.info(`Updating onboarding ${id} status to ${status}`);

    res.json({
      message: 'Status updated successfully',
      id: onboarding._id,
      status: onboarding.status
    });

  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

/**
 * Get tasks for an onboarding
 */
exports.getTasks = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if onboarding exists
    const onboarding = await Onboarding.findById(id);
    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    // Fetch tasks from database
    const tasks = await Task.find({ onboardingId: id }).sort({ order: 1, dueDate: 1 });

    res.json({
      tasks: tasks.map(t => ({
        id: t._id,
        name: t.name,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        category: t.category,
        completedAt: t.completedAt,
        notes: t.notes,
        order: t.order
      }))
    });

  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * Update task status
 */
exports.updateTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { status, notes } = req.body;

    logger.info(`Updating task ${taskId} for onboarding ${id}`, { status, notes });

    // Update task in database
    const updateData = { status, updatedAt: new Date() };
    if (notes) updateData.notes = notes;
    if (status === 'completed') updateData.completedAt = new Date();

    const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update onboarding progress
    const allTasks = await Task.find({ onboardingId: id });
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((completedTasks / allTasks.length) * 100);

    await Onboarding.findByIdAndUpdate(id, { progress });

    // If all tasks completed, mark onboarding as completed
    if (progress === 100) {
      await Onboarding.findByIdAndUpdate(id, { status: 'completed' });
      logger.info(`Onboarding ${id} completed - all tasks done!`);
    }

    res.json({
      message: 'Task updated successfully',
      taskId: task._id,
      status: task.status,
      progress
    });

  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Get onboarding progress
 */
exports.getProgress = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Calculate from database
    const progress = {
      overall: 65,
      categories: {
        accounts: { completed: 3, total: 3, percentage: 100 },
        equipment: { completed: 2, total: 3, percentage: 66 },
        training: { completed: 1, total: 4, percentage: 25 },
        meetings: { completed: 0, total: 2, percentage: 0 }
      },
      timeline: [
        { date: '2024-11-15', event: 'Start date', status: 'upcoming' },
        { date: '2024-11-18', event: 'First week check-in', status: 'scheduled' },
        { date: '2024-12-15', event: '30-day review', status: 'scheduled' }
      ]
    };

    res.json(progress);

  } catch (error) {
    logger.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

/**
 * Trigger a specific workflow
 */
exports.triggerWorkflow = async (req, res) => {
  try {
    const { id, workflowName } = req.params;

    logger.info(`Triggering workflow ${workflowName} for onboarding ${id}`);

    const result = await workflowEngine.triggerWorkflow(workflowName, {
      onboardingId: id
    });

    res.json({
      message: `Workflow ${workflowName} triggered successfully`,
      workflowId: result.workflowId,
      status: result.status
    });

  } catch (error) {
    logger.error('Error triggering workflow:', error);
    res.status(500).json({ error: 'Failed to trigger workflow' });
  }
};

/**
 * Delete onboarding (soft delete)
 */
exports.deleteOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Soft delete in database
    logger.info(`Deleting onboarding ${id}`);

    res.json({
      message: 'Onboarding deleted successfully',
      id
    });

  } catch (error) {
    logger.error('Error deleting onboarding:', error);
    res.status(500).json({ error: 'Failed to delete onboarding' });
  }
};
