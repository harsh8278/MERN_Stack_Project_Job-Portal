import { catchAsyncErrors } from "../middleweres/catchAsyncErrors.js"
import ErrorHandler from "../middleweres/error.js"
import { User } from "../models/userSchema.js"
import { v2 as cloudinary } from "cloudinary"
import { sendToken } from "../utils/jwtToken.js"

export const register = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, phone, address, password, role, firstNiche, secondNiche, thirdNiche, coverLetter } = req.body;

        if (!name || !email || !phone || !address || !password || !role) {
            return next(new ErrorHandler("All fileds are requird", 400));
        }
        if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
            return next(
                new ErrorHandler("Please provide your preferred job niches.", 400)
            );
        }

        const existinUser = await User.findOne({ email });
        if (existinUser) {
            return next(new ErrorHandler("Email is already register", 400))
        }

        const userDate = {
            name, email, phone, address, password,
            role,
            niches: {
                firstNiche,
                secondNiche,
                thirdNiche,
            },
            coverLetter
        };
        if (req.files && req.files.resume) {
            const { resume } = req.files;
            if (resume) {
                try {
                    const cloudinaryResponse = await cloudinary.uploader.upload(
                        resume.tempFilePath,
                        { folder: "Job_Seekers_Resume" }
                    );
                    if (!cloudinaryResponse || cloudinaryResponse.error) {
                        return next(
                            new ErrorHandler("Failed to upload resume to cloud.", 500)
                        );
                    }
                    userDate.resume = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                    };
                } catch (error) {
                    return next(new ErrorHandler("Failed to upload resume", 500));
                }
            }
        }
        const user = await User.create(userDate);
        sendToken(user, 201, res, "User Registered")
    } catch (error) {
        next(error);
    }
})


export const login = catchAsyncErrors(async (req, res, next) => {
    const { role, email, password } = req.body;
    if (!role || !email || !password) {
        return next(
            new ErrorHandler("Email password and role are required", 400)
        )
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password.", 400))
    }
    const isPasswordMethod = await user.comparePassword(password);
    if (!isPasswordMethod) {
        return next(new ErrorHandler("Invalid email or password", 400))
    }
    if (user.role !== role) {
        return next(new ErrorHandler("Invalid user role.", 400))
    }
    sendToken(user, 200, res, "User logged in successfully.")
})

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged out successfully.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserDate = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        coverLetter: req.body.coverLetter,
        niches: {
            firstNiche: req.body.firstNiche,
            secondNiche: req.body.secondNiche,
            thirdNiche: req.body.thirdNiche,
        }
    }
    const { firstNiche, secondNiche, thirdNiche } = newUserDate.niches;
    if (req.user.role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
        return next(new ErrorHandler("Please provide your all preferred job niches.", 400))
    }
    if (req.files) {
        const resume = req.files.resume;
        if (resume) {
            const currentResumeId = req.user.resume.public_id;
            if (currentResumeId) {
                await cloudinary.uploader.destroy(currentResumeId);
            }
            const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
                folder: "Job_Seekers_Resume"
            })
            newUserDate.resume = {
                public_id: newResume.public_id,
                url: newResume.secure_url,
            }
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserDate, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        user,
        message: "Profile updated."
    })
})


// export const forgotPassword = catchAsyncError(async (req, res, next) => {
//     const user = await User.findOne({
//         email: req.body.email,
//         accountVerified: true,
//     });
//     if (!user) {
//         return next(new ErrorHandler("User not found.", 404));
//     }
//     const resetToken = user.generateResetPasswordToken();
//     await user.save({ validateBeforeSave: false });
//     const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

//     const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

//     try {
//         sendEmail({
//             email: user.email,
//             subject: "MERN AUTHENTICATION APP RESET PASSWORD",
//             message,
//         });
//         res.status(200).json({
//             success: true,
//             message: `Email sent to ${user.email} successfully.`,
//         });
//     } catch (error) {
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;
//         await user.save({ validateBeforeSave: false });
//         return next(
//             new ErrorHandler(
//                 error.message ? error.message : "Cannot send reset password token.",
//                 500
//             )
//         );
//     }
// });


export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMethod = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMethod) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("New Password & confirm password is not match", 400))
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res, "Password updated successfully.")
})