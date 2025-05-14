import cron from "node-cron"
import { Job } from "../models/jobSchema.js"
import { User } from "../models/userSchema.js"
import { sendEmail } from "../utils/sendEmail.js"

export const newsLetterCron = () => {
    cron.schedule("* * * * *", async () => {
        const jobs = await Job.find({ newsLetterSend: false })
        for (const job of jobs) {
            try {
                const filteredUsers = await User.find({
                    $or: [
                        { "niches.firstNiche": job.jobNiche },
                        { "niches.secondNiche": job.jobNiche },
                        { "niches.thirdNiche": job.jobNiche },
                    ],
                });
                for (const user of filteredUsers) {
                    const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
                    const message = `<p>Hi ${user.name},</p>
                    \n\n<p>Great news! A new job that fits your niche has just been posted. The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately.</p>
                    \n\n<p><strong>Job Details:</strong></p>
                    \n\n<ul>
                    \n\n<li><strong>Position:</strong> ${job.title}</li>
                    \n\n<li><strong>Company:</strong> ${job.companyName}</li>
                    \n\n<li><strong>Location:</strong> ${job.location}</li>
                    \n\n<li><strong>Salary:</strong> ${job.salary}</li>
                    </ul>
                    \n\n<p>Don’t wait too long! Job openings like these are filled quickly.</p>
                    \n\n<p>We’re here to support you in your job search. Best of luck!</p>
                    \n\n<p>Best Regards,<p/>
                    \n<p>Harsh Gupta Team </p>`;
                    sendEmail({
                        email: user.email,
                        subject,
                        message,
                    });
                }
                job.newsLetterSend = true;
                await job.save();
            } catch (error) {
                console.log("ERROR IN NODE CRON CATCH BLOCK");
                return next(console.error(error || "Some error in Cron."));
            }
        }
    })
}
