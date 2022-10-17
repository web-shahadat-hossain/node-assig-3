const User = require("../models/User");
const bcrypt = require("bcryptjs");


exports.signupService = async (userInfo) => {
    if (userInfo.password !== userInfo.confirmPassword) {
        return "confirmPassword: Passwords don't match!";
    }
    const password = userInfo.password;
    const hashedPassword = bcrypt.hashSync(password);
    userInfo.password = hashedPassword;
    const user = await User.create(userInfo);
    return user;
};

exports.findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

exports.findUserByToken = async (token) => {
    return await User.findOne({ confirmationToken: token });
};

exports.findUserById = async (id) => {
    // return user info excluding password
    return await User.findOne({ _id: id }).select(
        "-password -__v -createdAt -updatedAt "
    );
};

exports.allCandidatesService = async () => {
    return await User.find({ role: "Candidate" })
        .select("-password -__v -createdAt -updatedAt ")
        .populate({
            path: "appliedJobs",
            populate: {
                path: "job",
                select: "-applications",
                populate: {
                    path: "companyInfo",
                    select: "-jobPosts",
                    populate: {
                        path: "managerName",
                        select:
                            "-password -__v -createdAt -updatedAt -role -appliedJobs -status ",
                    },
                },
            },
            select: "-applicant",
        });
};

exports.candidateByIdService = async (id) => {
    //get user with id and role candidate
    return await User.findOne({ _id: id, role: "Candidate" })
        .select("-password -__v -createdAt -updatedAt ")
        .populate({
            path: "appliedJobs",
            populate: {
                path: "job",
                select: "-applications",
                populate: {
                    path: "companyInfo",
                    select: "-jobPosts",
                    populate: {
                        path: "managerName",
                        select:
                            "-password -__v -createdAt -updatedAt -role -appliedJobs -status ",
                    },
                },
            },
            select: "-applicant",
        });
};

exports.allHiringManagersService = async () => {
    return await User.find({ role: "Hiring-Manager" }).select(
        "-password -__v -createdAt -updatedAt -appliedJobs"
    );
};

// const User = require("../models/User");
// const bcrypt = require("bcryptjs");

// exports.signupService = async (userInfo) => {
//     if (userInfo.password !== userInfo.confirmPassword) {
//         return "confirmPassword: Passwords don't match!";
//     }
//     const password = userInfo.password;
//     const hashedPassword = bcrypt.hashSync(password);
//     userInfo.password = hashedPassword;
//     const user = await User.create(userInfo);
//     return user;
// };

// exports.findUserByEmail = async (email) => {
//     const result = await User.findOne({ email });
//     console.log(result);
//     return result
// };

