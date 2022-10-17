const Company = require("../models/Company");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const {
    createJobService,
    updateJobService,
    getAllJobsService,
    getJobByIdService,
    applyJobService,
} = require("../services/job.service");
const { jobs } = require("googleapis/build/src/apis/jobs");

exports.createJob = async (req, res, next) => {
    try {
        const { email } = req.user;
        const manager = await User.findOne({ email });
        const company = await Company.findOne({ managerName: manager._id });


        const { deadline } = req.body;
        const today = new Date();
        const deadlineDate = new Date(deadline);
        if (deadlineDate < today) {
            return res.status(400).json({
                status: "fail",
                message: "Deadline must be atleast 1 day from now",
            });
        }

        const result = await createJobService(req.body);

        res.status(200).json({
            status: "success",
            message: "Job created successfully!",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: " Data is not inserted ",
            error: error.message,
        });
    }
};

exports.getJobsByManagerToken = async (req, res) => {
    try {
        const { email } = req.user;
        console.log(email,);
        const user = await User.findOne({ email }).select(
            "-password -__v -createdAt -updatedAt -role -status -appliedJobs"
        );
        console.log(user._id);
        const company = await Company.findOne({ managerName: user._id });
        const jobs = await Job.find({}).select("-applications").populate({
            path: "companyInfo",
            select: "-jobPosts",
        });
        console.log(jobs);
        const jobsByHM = jobs.filter((job) => {
            return job.createdBy.id == user._id.toString();
        });
        console.log(jobsByHM);
        res.status(200).json({
            status: "success",
            data: {
                managerInfo: user,
                jobs: jobsByHM,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: "can't get the data",
            error: error.message,
        });
    }
};

exports.getJobByManagerTokenJobId = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await User.findOne({ email }).select(
            "-password -__v -createdAt -updatedAt -role -status -appliedJobs"
        );
        const company = await Company.findOne({ managerName: user._id });
        const jobs = await Job.find({})
            .populate({
                path: "companyInfo",
                select: "-jobPosts",
            })
            .populate({
                path: "applications",
                populate: {
                    path: "applicant",
                    select:
                        "-password -__v -createdAt -updatedAt -role -status -appliedJobs",
                },
                select: "-job",
            });
        const { id } = req.params;
        const job = jobs.find((job) => {
            return job._id.toString() == id.toString();
        });

        res.status(200).json({
            status: "success",
            data: {
                managerInfo: user,
                job,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: "can't get the data",
            error: error.message,
        });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const { email } = req.user;
        const manager = await User.findOne({ email });
        console.log(manager.email);
        const company = await Company.findOne({
            managerName: manager._id
        }).populate({
            path: "jobPosts",
        });
        console.log(company);
        const job = company.jobPosts.find(
            (job) => job._id.toString() == req.params.id.toString()
        );

        if (!job) {
            return res.status(400).json({
                status: "fail",
                message: "You are not authorized to update this job",
            });
        }

        if (job._id != req.params.id) {
            return res.status(400).json({
                status: "fail",
                message: "You are not authorized to update this job",
            });
        }

        const { id } = req.params;
        const result = await updateJobService(id, req.body);

        res.status(200).json({
            status: "success",
            message: "Job updated successfully!",
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: " Data is not updated ",
            error: error.message,
        });
    }
};

exports.getAllJobs = async (req, res) => {
    try {


        let filters = { ...req.query };

        const excludeFields = ["sort", "page", "limit"];
        excludeFields.forEach((field) => delete filters[field]);

        let filtersString = JSON.stringify(filters);
        filtersString = filtersString.replace(
            /\b(gt|gte|lt|lte|ne|eq)\b/g,
            (match) => `$${match}`
        );

        filters = JSON.parse(filtersString);

        const queries = {};

        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            queries.sortBy = sortBy;
        }

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            queries.fields = fields;
        }

        if (req.query.page) {
            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * parseInt(limit);
            queries.skip = skip;
            queries.limit = parseInt(limit);
        }

        const jobs = await getAllJobsService(filters, queries);

        res.status(200).json({
            status: "success",
            data: jobs,
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: "can't get the data",
            error: error.message,
        });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await getJobByIdService(id);

        res.status(200).json({
            status: "success",
            data: job,
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: "can't get the data",
            error: error.message,
        });
    }
};

exports.applyJob = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await User.findOne({ email }).select(
            "-password -__v -createdAt -updatedAt -role -status -appliedJobs"
        );

        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(400).json({
                status: "fail",
                message: "Job not found",
            });
        }

        const today = new Date();
        const deadline = new Date(job.deadline);
        if (today > deadline) {
            return res.status(400).json({
                status: "fail",
                message: "Application deadline is over. try next time",
            });
        }

        const applications = await Application.find({ job: job._id });
        const isApplied = applications.find(
            (application) =>
                application.applicant._id.toString() == user._id.toString()
        );

        if (isApplied) {
            return res.status(400).json({
                status: "fail",
                message: "You have already applied for this job",
            });
        }

        const result = await applyJobService(id, user._id);

        res.status(200).json({
            status: "success",
            message: "Job applied successfully!",
            result: result,
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: "can't get the data",
            error: error.message,
        });
    }
};